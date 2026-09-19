const { pool } = require('../config/database');

// Valid status transitions for Xerox Staff
const VALID_TRANSITIONS = {
  PENDING:  ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PRINTING', 'CANCELLED'],
  PRINTING: ['READY'],
  READY:    ['COLLECTED'],
  COLLECTED: [],
  CANCELLED: []
};

/**
 * Get today's orders with optional status filter
 * GET /api/staff/orders?status=PENDING&date=
 */
const getStaffOrders = async (req, res, next) => {
  try {
    const statusFilter = req.query.status || '';
    const dateFilter = req.query.date || new Date().toISOString().split('T')[0];

    let whereClause = 'WHERE o.batch_date = ?';
    const params = [dateFilter];

    if (statusFilter && ['PENDING','ACCEPTED','PRINTING','READY','COLLECTED','CANCELLED'].includes(statusFilter)) {
      whereClause += ' AND o.status = ?';
      params.push(statusFilter);
    }

    const [orders] = await pool.query(
      `SELECT
         o.id, o.order_number, o.batch_date, o.status,
         o.printing_total, o.stationery_total, o.total_amount,
         o.additional_instructions, o.created_at,
         u.name as student_name, u.register_number, u.phone, u.department, u.year,
         (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as files_count,
         (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as stationery_count,
         p.payment_status, p.transaction_reference
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN payments p ON p.order_id = o.id
       ${whereClause}
       ORDER BY
         FIELD(o.status, 'PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED'),
         o.created_at ASC`,
      params
    );

    // Count by status for this date
    const [counts] = await pool.query(
      `SELECT status, COUNT(*) as cnt
       FROM orders
       WHERE batch_date = ?
       GROUP BY status`,
      [dateFilter]
    );

    const statusCounts = {};
    counts.forEach((r) => { statusCounts[r.status] = Number(r.cnt); });

    return res.status(200).json({
      status: 'success',
      data: { orders, statusCounts, date: dateFilter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full order detail for staff
 * GET /api/staff/orders/:id
 */
const getStaffOrderDetail = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    const [orders] = await pool.query(
      `SELECT o.*,
              u.name as student_name, u.register_number, u.phone, u.email, u.department, u.year,
              p.payment_status, p.transaction_reference, p.amount as paid_amount, p.paid_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    const order = orders[0];

    const [files] = await pool.query(
      'SELECT * FROM order_files WHERE order_id = ? ORDER BY id',
      [orderId]
    );

    const [items] = await pool.query(
      `SELECT oi.*, s.name as stationery_name, s.description
       FROM order_items oi JOIN stationery s ON s.id = oi.stationery_id
       WHERE oi.order_id = ? ORDER BY oi.id`,
      [orderId]
    );

    const [history] = await pool.query(
      `SELECT osh.previous_status, osh.new_status, osh.created_at, u.name as changed_by_name
       FROM order_status_history osh
       LEFT JOIN users u ON u.id = osh.changed_by
       WHERE osh.order_id = ? ORDER BY osh.created_at ASC`,
      [orderId]
    );

    return res.status(200).json({
      status: 'success',
      data: { order, files, items, history }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (staff only)
 * PATCH /api/staff/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const staffId = req.user.id;
    const orderId = parseInt(req.params.id, 10);
    const new_status = req.body.new_status || req.body.status;

    if (!new_status) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ status: 'error', message: 'new_status is required.' });
    }

    const [orders] = await conn.query('SELECT id, status FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    const currentStatus = orders[0].status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(new_status)) {
      await conn.rollback(); conn.release();
      return res.status(400).json({
        status: 'error',
        message: `Cannot transition from ${currentStatus} to ${new_status}. Allowed: ${allowed.join(', ') || 'none'}.`
      });
    }

    // Update order status
    await conn.query('UPDATE orders SET status = ? WHERE id = ?', [new_status, orderId]);

    // Log status history
    await conn.query(
      'INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [orderId, currentStatus, new_status, staffId]
    );

    // If order is COLLECTED, mark payment as PAID
    if (new_status === 'COLLECTED') {
      await conn.query(
        "UPDATE payments SET payment_status = 'PAID', paid_at = NOW() WHERE order_id = ? AND payment_status = 'PENDING'",
        [orderId]
      );
    }

    // Retrieve user_id and order_number to trigger in-app notification
    const [orderDetails] = await conn.query('SELECT user_id, order_number FROM orders WHERE id = ?', [orderId]);
    if (orderDetails.length > 0) {
      const studentId = orderDetails[0].user_id;
      const orderNum = orderDetails[0].order_number;
      let notifTitle = `Order ${new_status}`;
      let notifMsg = `Your order ${orderNum} status has changed to ${new_status}.`;

      if (new_status === 'ACCEPTED') {
        notifTitle = 'Order Accepted';
        notifMsg = `Central Xerox Counter has accepted order ${orderNum}. Preparing for printing.`;
      } else if (new_status === 'PRINTING') {
        notifTitle = 'Printing in Progress';
        notifMsg = `Your documents in order ${orderNum} are now being printed and bound.`;
      } else if (new_status === 'READY') {
        notifTitle = 'Order Ready for Pickup! 🎉';
        notifMsg = `Order ${orderNum} is ready! Please collect it at the College Xerox Counter with your Order ID.`;
      } else if (new_status === 'COLLECTED') {
        notifTitle = 'Order Collected';
        notifMsg = `Order ${orderNum} has been marked as collected. Thank you for using XeroXpress!`;
      } else if (new_status === 'CANCELLED') {
        notifTitle = 'Order Cancelled';
        notifMsg = `Order ${orderNum} was cancelled by Xerox staff.`;
      }

      await conn.query(
        `INSERT INTO notifications (user_id, order_id, title, message, type)
         VALUES (?, ?, ?, ?, 'ORDER_STATUS')`,
        [studentId, orderId, notifTitle, notifMsg]
      );
    }

    await conn.commit();
    conn.release();

    return res.status(200).json({
      status: 'success',
      message: `Order ${orderId} status updated to ${new_status}.`,
      previous_status: currentStatus,
      new_status
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};

module.exports = { getStaffOrders, getStaffOrderDetail, updateOrderStatus };
