const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/database');

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired authentication session. Please sign in again.'
      });
    }

    // Verify user exists and is active in database
    const [users] = await pool.query(
      'SELECT id, name, register_number, email, phone, department, year, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'User account not found or is currently inactive.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles - e.g. 'STUDENT', 'XEROX_STAFF', 'ADMIN'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Access requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
