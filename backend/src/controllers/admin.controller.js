const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { checkOrderWindowStatus } = require('./student.controller');

/**
 * Get Admin Dashboard Overview & Key Analytics
 * GET /api/admin/dashboard
 */
const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Core platform metrics
    const [counts] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'XEROX_STAFF') as total_staff,
        (SELECT COUNT(*) FROM orders WHERE batch_date = ?) as today_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'PRINTING') as printing_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'READY') as ready_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'COLLECTED') as completed_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'CANCELLED') as total_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE batch_date = ? AND status != 'CANCELLED') as today_revenue,
        (SELECT COUNT(*) FROM stationery WHERE is_active = TRUE) as active_stationery_count,
        (SELECT COUNT(*) FROM stationery WHERE stock < 20 AND is_active = TRUE) as low_stock_count
    `, [todayStr, todayStr]);

    // 2. Order Window status
    const orderWindow = await checkOrderWindowStatus();

    // 3. Status breakdown
    const [statusBreakdown] = await pool.query(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      GROUP BY status
    `);

    // 4. Daily trends (Last 7 days)
    const [dailyTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(batch_date, '%Y-%m-%d') as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE batch_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY batch_date
      ORDER BY batch_date ASC
    `);

    // 5. Recent 6 orders
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id, o.order_number, o.batch_date, o.status, o.total_amount, o.created_at,
        u.name as student_name, u.register_number, u.department,
        p.payment_status, p.transaction_reference,
        (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as files_count
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN payments p ON p.order_id = o.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    return res.status(200).json({
      status: 'success',
      data: {
        metrics: counts[0],
        orderWindow,
        statusBreakdown,
        dailyTrends,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Users (Students, Staff, Admin) with search and filters
 * GET /api/admin/users?role=STUDENT&search=&department=&year=
 */
const getUsers = async (req, res, next) => {
  try {
    const { role = 'STUDENT', search = '', department = '', year = '' } = req.query;

    let query = `
      SELECT 
        u.id, u.name, u.register_number, u.email, u.phone, 
        u.department, u.year, u.role, u.is_active, u.created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = u.id AND status != 'CANCELLED') as total_spent
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role && ['STUDENT', 'XEROX_STAFF', 'ADMIN'].includes(role)) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.register_number LIKE ? OR u.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (department && department !== 'ALL') {
      query += ' AND u.department = ?';
      params.push(department);
    }

    if (year && year !== 'ALL') {
      query += ' AND u.year = ?';
      params.push(year);
    }

    query += ' ORDER BY u.created_at DESC';

    const [users] = await pool.query(query, params);

    return res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new Xerox Staff account
 * POST /api/admin/staff
 */
const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, phone, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    const passwordSalt = 10;
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 'XEROX_STAFF', TRUE)`,
      [name.trim(), cleanEmail, phone.trim(), passwordHash]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Xerox staff account created successfully.',
      data: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        role: 'XEROX_STAFF',
        is_active: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active/inactive status
 * PATCH /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentAdminId = req.user.id;

    if (targetUserId === currentAdminId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot deactivate your own admin account.'
      });
    }

    const [users] = await pool.query('SELECT id, is_active, role, name FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const newStatus = !users[0].is_active;

    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, targetUserId]);

    return res.status(200).json({
      status: 'success',
      message: `User ${users[0].name} has been ${newStatus ? 'activated' : 'deactivated'}.`,
      is_active: newStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders across platform with filters & search
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status = '', search = '', batch_date = '' } = req.query;

    let query = `
      SELECT 
        o.id, o.order_number, o.batch_date, o.status,
        o.printing_total, o.stationery_total, o.total_amount,
        o.additional_instructions, o.created_at,
        u.id as user_id, u.name as student_name, u.register_number, u.email, u.phone, u.department, u.year,
        p.payment_status, p.payment_method, p.transaction_reference,
        (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as files_count,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as stationery_count
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (batch_date) {
      query += ' AND o.batch_date = ?';
      params.push(batch_date);
    }

    if (search) {
      query += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.register_number LIKE ? OR p.transaction_reference LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.query(query, params);

    return res.status(200).json({
      status: 'success',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Stationery catalog (active & inactive)
 * GET /api/admin/stationery
 */
const getStationeryList = async (req, res, next) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        s.id, s.name, s.description, s.price, s.stock, s.is_active, s.created_at, s.updated_at,
        (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE stationery_id = s.id) as total_sold
      FROM stationery s
      ORDER BY s.is_active DESC, s.name ASC
    `);

    return res.status(200).json({
      status: 'success',
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Stationery Item
 * POST /api/admin/stationery
 */
const createStationery = async (req, res, next) => {
  try {
    const { name, description, price, stock, is_active } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Item name and price are required.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO stationery (name, description, price, stock, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), description || '', parseFloat(price), parseInt(stock || 0, 10), is_active !== false]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Stationery item created successfully.',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Stationery Item
 * PUT /api/admin/stationery/:id
 */
const updateStationery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, is_active } = req.body;

    await pool.query(
      `UPDATE stationery
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           stock = COALESCE(?, stock),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        description !== undefined ? description : null,
        price !== undefined ? parseFloat(price) : null,
        stock !== undefined ? parseInt(stock, 10) : null,
        is_active !== undefined ? Boolean(is_active) : null,
        id
      ]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Stationery item updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Stationery Active Status
 * PATCH /api/admin/stationery/:id/status
 */
const toggleStationeryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query('SELECT is_active, name FROM stationery WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Stationery item not found.' });
    }

    const newStatus = !items[0].is_active;
    await pool.query('UPDATE stationery SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      status: 'success',
      message: `Item "${items[0].name}" is now ${newStatus ? 'active' : 'inactive'}.`,
      is_active: newStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Print Pricing
 * GET /api/admin/pricing
 */
const getPrintPrices = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM print_prices ORDER BY print_type, side_type');
    return res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Print Pricing
 * PUT /api/admin/pricing
 */
const updatePrintPrices = async (req, res, next) => {
  try {
    const { prices } = req.body; // Array of { id, price_per_page } or { print_type, side_type, price_per_page }

    if (!prices || !Array.isArray(prices)) {
      return res.status(400).json({
        status: 'error',
        message: 'Prices array is required.'
      });
    }

    for (const item of prices) {
      if (item.id) {
        await pool.query(
          'UPDATE print_prices SET price_per_page = ? WHERE id = ?',
          [parseFloat(item.price_per_page), item.id]
        );
      } else if (item.print_type && item.side_type) {
        await pool.query(
          'UPDATE print_prices SET price_per_page = ? WHERE print_type = ? AND side_type = ?',
          [parseFloat(item.price_per_page), item.print_type, item.side_type]
        );
      }
    }

    const [updated] = await pool.query('SELECT * FROM print_prices ORDER BY print_type, side_type');

    return res.status(200).json({
      status: 'success',
      message: 'Print rates updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get System Settings
 * GET /api/admin/settings
 */
const getSystemSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_settings');
    const settingsObj = {};
    rows.forEach(r => { settingsObj[r.setting_key] = r.setting_value; });

    return res.status(200).json({
      status: 'success',
      data: {
        list: rows,
        settings: settingsObj
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update System Settings
 * PUT /api/admin/settings
 */
const updateSystemSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // Object e.g. { order_open_time: '06:00', order_close_time: '20:30', ordering_enabled: 'true' }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Settings object is required.'
      });
    }

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'System settings saved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Comprehensive Business Reports & Analytics
 * GET /api/admin/reports
 */
const getReports = async (req, res, next) => {
  try {
    // 1. Overall summary
    const [overall] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(printing_total), 0) as printing_revenue,
        COALESCE(SUM(stationery_total), 0) as stationery_revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status != 'CANCELLED'
    `);

    // 2. Orders by status
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      GROUP BY status
    `);

    // 3. Print type breakdown
    const [printTypes] = await pool.query(`
      SELECT 
        print_type, side_type,
        COUNT(*) as total_files,
        SUM(copies) as total_copies
      FROM order_files
      GROUP BY print_type, side_type
    `);

    // 4. Top stationery items
    const [popularStationery] = await pool.query(`
      SELECT 
        s.name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as total_sales
      FROM order_items oi
      JOIN stationery s ON s.id = oi.stationery_id
      GROUP BY s.id, s.name
      ORDER BY units_sold DESC
      LIMIT 8
    `);

    // 5. Orders by Department
    const [byDept] = await pool.query(`
      SELECT 
        u.department,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.status != 'CANCELLED'
      GROUP BY u.department
      ORDER BY order_count DESC
    `);

    // 6. Monthly trends (last 6 months)
    const [monthlyTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(batch_date, '%Y-%m') as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE batch_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(batch_date, '%Y-%m')
      ORDER BY month ASC
    `);

    return res.status(200).json({
      status: 'success',
      data: {
        overall: overall[0] || {},
        byStatus,
        printTypes,
        popularStationery,
        byDept,
        monthlyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardSummary,
  getUsers,
  createStaff,
  toggleUserStatus,
  getAllOrders,
  getStationeryList,
  createStationery,
  updateStationery,
  toggleStationeryStatus,
  getPrintPrices,
  updatePrintPrices,
  getSystemSettings,
  updateSystemSettings,
  getReports
};
