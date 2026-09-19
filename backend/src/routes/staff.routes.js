const express = require('express');
const router = express.Router();
const { getStaffOrders, getStaffOrderDetail, updateOrderStatus } = require('../controllers/staff.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All staff routes require auth + XEROX_STAFF or ADMIN role
router.use(authenticateToken);
router.use(requireRole('XEROX_STAFF', 'ADMIN'));

// GET /api/staff/orders?status=PENDING&date=YYYY-MM-DD
router.get('/orders', getStaffOrders);

// GET /api/staff/orders/:id
router.get('/orders/:id', getStaffOrderDetail);

// PATCH /api/staff/orders/:id/status
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
