const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { countPdfPages } = require('../utils/pdfHelper');
const { checkOrderWindowStatus } = require('./student.controller');

/**
 * Handle multipart PDF uploads
 * POST /api/orders/upload
 */
const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No PDF files were uploaded. Please select at least one valid PDF.'
      });
    }

    const processedFiles = req.files.map((file) => {
      const pageCount = countPdfPages(file.path);
      return {
        original_name: file.originalname,
        stored_filename: file.filename,
        file_path: file.path,
        file_size: file.size,
        page_count: pageCount,
        config: {
          copies: 1,
          print_type: 'BLACK_WHITE',
          side_type: 'SINGLE_SIDE',
          page_range: 'ALL',
          instructions: ''
        }
      };
    });

    return res.status(200).json({
      status: 'success',
      message: `${processedFiles.length} file(s) uploaded and scanned successfully.`,
      files: processedFiles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active Print Prices from database
 * GET /api/orders/prices
 */
const getPrintPrices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, print_type, side_type, price_per_page, is_active FROM print_prices WHERE is_active = TRUE ORDER BY print_type, side_type'
    );

    const pricingMap = {};
    rows.forEach((row) => {
      const key = `${row.print_type}_${row.side_type}`;
      pricingMap[key] = parseFloat(row.price_per_page);
    });

    return res.status(200).json({
      status: 'success',
      prices: rows,
      pricingMap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active Stationery catalog
 * GET /api/orders/stationery
 */
const getStationery = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, stock FROM stationery WHERE is_active = TRUE AND stock > 0 ORDER BY name'
    );

    return res.status(200).json({
      status: 'success',
      stationery: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an unsubmitted draft uploaded file
 * DELETE /api/orders/upload/:filename
 */
const deleteDraftFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(__dirname, '../../uploads', safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ status: 'success', message: 'Draft file removed successfully.' });
    } else {
      return res.status(404).json({ status: 'error', message: 'File not found on server.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Generate unique order number: XRP-YYYY-XXXXXX
 */
const generateOrderNumber = async (db) => {
  const year = new Date().getFullYear();
  const prefix = `XRP-${year}-`;
  const [rows] = await db.query(
    "SELECT COUNT(*) as cnt FROM orders WHERE order_number LIKE ?",
    [`${prefix}%`]
  );
  const seq = String(Number(rows[0].cnt) + 1).padStart(6, '0');
  return `${prefix}${seq}`;
};

/**
 * Create a full Order
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const studentId = req.user.id;
    const {
      files,          // array of { stored_filename, original_name, page_count, file_size, config }
      stationery,     // array of { stationery_id, quantity }
      payment_reference,
      payment_method,
      payment_status,
      additional_instructions
    } = req.body;

    // 1. Validate order window
    const windowStatus = await checkOrderWindowStatus();
    if (!windowStatus.orderingEnabled) {
      await conn.rollback();
      conn.release();
      return res.status(403).json({
        status: 'error',
        message: 'Online ordering is currently disabled by the campus administrator.',
        orderWindow: windowStatus
      });
    }

    // 2. Validate files exist
    if (!files || files.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ status: 'error', message: 'At least one PDF file is required.' });
    }

    // 3. Fetch current print prices for server-side calculation
    const [priceRows] = await conn.query(
      'SELECT print_type, side_type, price_per_page FROM print_prices WHERE is_active = TRUE'
    );
    const priceMap = {};
    priceRows.forEach((r) => {
      priceMap[`${r.print_type}_${r.side_type}`] = parseFloat(r.price_per_page);
    });

    // 4. Calculate printing total (server-side, never trust frontend)
    let printingTotal = 0;
    const fileData = [];

    for (const f of files) {
      const copies = Math.max(1, parseInt(f.config?.copies || 1, 10));
      const print_type = ['BLACK_WHITE', 'COLOR'].includes(f.config?.print_type) ? f.config.print_type : 'BLACK_WHITE';
      const side_type = ['SINGLE_SIDE', 'DOUBLE_SIDE'].includes(f.config?.side_type) ? f.config.side_type : 'SINGLE_SIDE';
      const page_range = f.config?.page_range || 'ALL';
      const instructions = f.config?.instructions || '';

      // Calculate effective page count from range
      let effectivePages = parseInt(f.page_count || 1, 10);
      if (page_range && page_range.trim().toUpperCase() !== 'ALL') {
        try {
          const parts = page_range.split(',').map((p) => p.trim());
          const pageSet = new Set();
          for (const part of parts) {
            if (part.includes('-')) {
              const [start, end] = part.split('-').map(Number);
              if (!isNaN(start) && !isNaN(end)) {
                const min = Math.max(1, Math.min(start, end));
                const max = Math.min(effectivePages, Math.max(start, end));
                for (let p = min; p <= max; p++) pageSet.add(p);
              }
            } else {
              const pageNum = Number(part);
              if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= effectivePages) pageSet.add(pageNum);
            }
          }
          if (pageSet.size > 0) effectivePages = pageSet.size;
        } catch (_) { /* keep full page count */ }
      }

      const rateKey = `${print_type}_${side_type}`;
      const rate = priceMap[rateKey] || (print_type === 'COLOR' ? 5.00 : 1.50);
      const fileCost = effectivePages * rate * copies;
      printingTotal += fileCost;

      fileData.push({
        stored_filename: f.stored_filename,
        original_name: f.original_name,
        copies,
        print_type,
        side_type,
        page_range,
        instructions
      });
    }

    // 5. Calculate stationery total (server-side)
    let stationeryTotal = 0;
    const stationeryData = [];

    if (stationery && stationery.length > 0) {
      for (const item of stationery) {
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        const [sRows] = await conn.query(
          'SELECT id, name, price, stock FROM stationery WHERE id = ? AND is_active = TRUE',
          [item.stationery_id]
        );
        if (sRows.length === 0) continue;
        const sItem = sRows[0];
        if (sItem.stock < qty) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({
            status: 'error',
            message: `Insufficient stock for "${sItem.name}". Available: ${sItem.stock}.`
          });
        }
        const unitPrice = parseFloat(sItem.price);
        const totalPrice = unitPrice * qty;
        stationeryTotal += totalPrice;
        stationeryData.push({ stationery_id: item.stationery_id, quantity: qty, unit_price: unitPrice, total_price: totalPrice });
      }
    }

    const subtotal = printingTotal + stationeryTotal;
    const totalAmount = subtotal; // No additional charges

    // 6. Generate order number
    const orderNumber = await generateOrderNumber(conn);
    const batchDate = windowStatus.currentBatchDate;

    // 7. Insert order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, user_id, batch_date, status, printing_total, stationery_total, subtotal, total_amount, additional_instructions)
       VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
      [orderNumber, studentId, batchDate, printingTotal.toFixed(2), stationeryTotal.toFixed(2), subtotal.toFixed(2), totalAmount.toFixed(2), additional_instructions || null]
    );
    const orderId = orderResult.insertId;

    // 8. Insert order_files
    for (const f of fileData) {
      const storedPath = path.resolve(__dirname, '../../uploads', path.basename(f.stored_filename));
      await conn.query(
        `INSERT INTO order_files (order_id, original_filename, stored_filename, file_path, copies, print_type, side_type, page_range, instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, f.original_name, f.stored_filename, storedPath, f.copies, f.print_type, f.side_type, f.page_range, f.instructions]
      );
    }

    // 9. Insert order_items + update stock
    for (const si of stationeryData) {
      await conn.query(
        'INSERT INTO order_items (order_id, stationery_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [orderId, si.stationery_id, si.quantity, si.unit_price, si.total_price]
      );
      await conn.query('UPDATE stationery SET stock = stock - ? WHERE id = ?', [si.quantity, si.stationery_id]);
    }

    // 10. Server-side payment validation & print release protection
    const rzpOrderId = req.body.razorpay_order_id || null;
    const finalRef = payment_reference || null;

    if (!finalRef && !rzpOrderId) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        status: 'error',
        message: 'A verified Razorpay payment is required to place a print order.'
      });
    }

    // Verify transaction against payment_transactions table
    const [txRows] = await conn.query(
      `SELECT id, amount, status, order_id, user_id, razorpay_payment_id, payment_method
       FROM payment_transactions 
       WHERE (razorpay_payment_id = ? OR (razorpay_order_id = ? AND razorpay_order_id IS NOT NULL)) 
         AND user_id = ?`,
      [finalRef || '', rzpOrderId || '', studentId]
    );

    if (txRows.length === 0 || txRows[0].status !== 'PAID') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed: No confirmed Razorpay payment found for this transaction.'
      });
    }

    const tx = txRows[0];
    const txAmount = parseFloat(tx.amount);

    // Amount tampering protection: compare verified transaction amount with calculated total
    if (Math.abs(txAmount - totalAmount) > 0.05) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        status: 'error',
        message: `Payment amount mismatch: Order total is ₹${totalAmount.toFixed(2)}, but verified payment amount was ₹${txAmount.toFixed(2)}.`
      });
    }

    // Protection against reusing the same payment for multiple print orders
    const resolvedPayId = tx.razorpay_payment_id || finalRef;
    if (resolvedPayId) {
      const [duplicateOrderUsage] = await conn.query(
        `SELECT order_id FROM payments WHERE transaction_reference = ?`,
        [resolvedPayId]
      );
      if (duplicateOrderUsage.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          status: 'error',
          message: `Payment transaction (${resolvedPayId}) has already been used for order #${duplicateOrderUsage[0].order_id}. Cannot reuse payment.`
        });
      }
    }

    const finalPaymentStatus = 'PAID';
    const finalPaymentMethod = tx.payment_method || payment_method || 'RAZORPAY';
    const paidAt = new Date();

    await conn.query(
      `INSERT INTO payments (order_id, amount, payment_method, transaction_reference, payment_status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, totalAmount.toFixed(2), finalPaymentMethod, resolvedPayId, finalPaymentStatus, paidAt]
    );

    // Link payment_transactions row to this newly created order
    await conn.query(
      `UPDATE payment_transactions
       SET order_id = ?
       WHERE id = ?`,
      [orderId, tx.id]
    );

    // 11. Insert status history
    await conn.query(
      'INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by) VALUES (?, NULL, \'PENDING\', ?)',
      [orderId, studentId]
    );

    // 12. Create in-app order submission notification
    await conn.query(
      `INSERT INTO notifications (user_id, order_id, title, message, type)
       VALUES (?, ?, 'Order Placed Successfully', ?, 'ORDER_STATUS')`,
      [
        studentId,
        orderId,
        `Your order ${orderNumber} has been received for the ${batchDate} batch. Total amount: ₹${totalAmount.toFixed(2)}.`
      ]
    );

    await conn.commit();
    conn.release();

    return res.status(201).json({
      status: 'success',
      message: `Order ${orderNumber} placed successfully!`,
      order: {
        id: orderId,
        order_number: orderNumber,
        batch_date: batchDate,
        status: 'PENDING',
        printing_total: printingTotal.toFixed(2),
        stationery_total: stationeryTotal.toFixed(2),
        total_amount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};

/**
 * Get student's order detail (with files + items + payment)
 * GET /api/orders/:id
 */
const getStudentOrderDetail = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const orderId = parseInt(req.params.id, 10);

    const [orders] = await pool.query(
      `SELECT o.*, p.payment_status, p.transaction_reference, p.amount as paid_amount, p.paid_at
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, studentId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    const order = orders[0];

    const [files] = await pool.query(
      'SELECT id, original_filename, copies, print_type, side_type, page_range, instructions FROM order_files WHERE order_id = ? ORDER BY id',
      [orderId]
    );

    const [items] = await pool.query(
      `SELECT oi.id, oi.quantity, oi.unit_price, oi.total_price, s.name as stationery_name, s.description
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
 * Get student's full order history
 * GET /api/orders/history?page=1&status=
 */
const getStudentOrderHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || '';

    let whereClause = 'WHERE o.user_id = ?';
    const params = [studentId];

    if (statusFilter && ['PENDING','ACCEPTED','PRINTING','READY','COLLECTED','CANCELLED'].includes(statusFilter)) {
      whereClause += ' AND o.status = ?';
      params.push(statusFilter);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );
    const total = Number(countRows[0].total);

    const [orders] = await pool.query(
      `SELECT o.id, o.order_number, o.batch_date, o.status, o.total_amount, o.created_at,
              (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as files_count,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as stationery_count,
              p.payment_status, p.transaction_reference
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Cancel a student's own PENDING order
 * PATCH /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const studentId = req.user.id;
    const orderId = parseInt(req.params.id, 10);

    const [orders] = await conn.query(
      'SELECT id, status, order_number FROM orders WHERE id = ? AND user_id = ?',
      [orderId, studentId]
    );

    if (orders.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    const order = orders[0];
    if (order.status !== 'PENDING') {
      await conn.rollback(); conn.release();
      return res.status(400).json({
        status: 'error',
        message: `Only PENDING orders can be cancelled. Current status: ${order.status}.`
      });
    }

    await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['CANCELLED', orderId]);
    await conn.query(
      'INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [orderId, 'PENDING', 'CANCELLED', studentId]
    );

    // Restore stationery stock
    const [items] = await conn.query('SELECT stationery_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      await conn.query('UPDATE stationery SET stock = stock + ? WHERE id = ?', [item.quantity, item.stationery_id]);
    }

    await conn.commit();
    conn.release();

    return res.status(200).json({
      status: 'success',
      message: `Order ${order.order_number} has been cancelled.`
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};

module.exports = {
  uploadFiles,
  getPrintPrices,
  getStationery,
  deleteDraftFile,
  createOrder,
  cancelOrder,
  getStudentOrderDetail,
  getStudentOrderHistory
};
