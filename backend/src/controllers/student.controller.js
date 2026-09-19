const { pool } = require('../config/database');

/**
 * Helper to check current order window against system settings
 */
const checkOrderWindowStatus = async () => {
  const [rows] = await pool.query(
    "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('order_open_time', 'order_close_time', 'ordering_enabled')"
  );

  const settings = {};
  rows.forEach((r) => {
    settings[r.setting_key] = r.setting_value;
  });

  const openTimeStr = settings.order_open_time || '06:00';
  const closeTimeStr = settings.order_close_time || '20:30';
  const orderingEnabled = settings.ordering_enabled !== 'false';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openTimeStr.split(':').map(Number);
  const [closeH, closeM] = closeTimeStr.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isWithinWindow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  const isOpen = orderingEnabled && isWithinWindow;

  // Batch calculation
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const currentBatchDate = isOpen ? todayStr : tomorrowStr;
  const batchLabel = isOpen ? "Today's Batch" : "Tomorrow Morning Batch";

  return {
    isOpen,
    orderingEnabled,
    openTime: openTimeStr,
    closeTime: closeTimeStr,
    currentTime: now.toTimeString().split(' ')[0].substring(0, 5),
    currentBatchDate,
    batchLabel,
    message: isOpen 
      ? "Orders are currently OPEN for today's batch."
      : "Today's batch is closed. Orders placed now will be processed in tomorrow morning's batch."
  };
};

/**
 * Get Student Dashboard metrics, order window status, and recent orders
 * GET /api/student/dashboard
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // 1. Order Window & Batch Information
    const windowStatus = await checkOrderWindowStatus();

    // 2. Aggregate statistics for this student
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('PENDING', 'ACCEPTED', 'PRINTING') THEN 1 ELSE 0 END) as active_orders,
        SUM(CASE WHEN status = 'READY' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN status = 'COLLECTED' THEN 1 ELSE 0 END) as completed_orders,
        COALESCE(SUM(total_amount), 0.00) as total_spent
      FROM orders
      WHERE user_id = ?
    `, [studentId]);

    const stats = statsRows[0] || {
      total_orders: 0,
      active_orders: 0,
      ready_orders: 0,
      completed_orders: 0,
      total_spent: 0.00
    };

    // 3. Fetch Recent Orders (Limit 5) with items count & files count
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.batch_date,
        o.status,
        o.total_amount,
        o.created_at,
        (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as files_count,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as stationery_count,
        p.payment_status
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [studentId]);

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          id: req.user.id,
          name: req.user.name,
          register_number: req.user.register_number,
          department: req.user.department,
          year: req.user.year,
          email: req.user.email,
          phone: req.user.phone
        },
        orderWindow: windowStatus,
        stats: {
          totalOrders: Number(stats.total_orders || 0),
          activeOrders: Number(stats.active_orders || 0),
          readyOrders: Number(stats.ready_orders || 0),
          completedOrders: Number(stats.completed_orders || 0),
          totalSpent: parseFloat(stats.total_spent || 0).toFixed(2)
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Profile Information
 * GET /api/student/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, name, register_number, email, phone, department, year, role, is_active, created_at
       FROM users
       WHERE id = ?`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Student profile not found.' });
    }

    const student = rows[0];

    // Get order history count
    const [orderCountRows] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [studentId]
    );

    student.total_orders = orderCountRows[0]?.count || 0;

    return res.status(200).json({
      status: 'success',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Student Profile (Phone, Department, Year)
 * PUT /api/student/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { phone, department, year } = req.body;

    await pool.query(
      `UPDATE users 
       SET phone = COALESCE(?, phone),
           department = COALESCE(?, department),
           year = COALESCE(?, year)
       WHERE id = ?`,
      [phone?.trim() || null, department || null, year || null, studentId]
    );

    const [updatedRows] = await pool.query(
      'SELECT id, name, register_number, email, phone, department, year, role, is_active FROM users WHERE id = ?',
      [studentId]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getProfile,
  updateProfile,
  checkOrderWindowStatus
};
