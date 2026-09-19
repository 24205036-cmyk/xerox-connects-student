const { pool } = require('../config/database');

/**
 * Helper to generate internal notification
 */
const createNotification = async (userId, orderId, title, message, type = 'ORDER_STATUS') => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, order_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [userId, orderId || null, title, message, type]
    );
  } catch (err) {
    console.error('Notification creation failed silently:', err.message);
  }
};

/**
 * Get all notifications for current user
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, order_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return res.status(200).json({
      status: 'success',
      unreadCount: unreadCount[0]?.count || 0,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
