const express = require('express');
const router = express.Router();
const {
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
  getReports,
  getPaymentTransactions,
  reviewExtraPayment
} = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All Admin routes require ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Dashboard Summary
router.get('/dashboard', getAdminDashboardSummary);

// User Management (Students & Staff)
router.get('/users', getUsers);
router.post('/staff', createStaff);
router.patch('/users/:id/status', toggleUserStatus);

// Order Management
router.get('/orders', getAllOrders);

// Stationery Management
router.get('/stationery', getStationeryList);
router.post('/stationery', createStationery);
router.put('/stationery/:id', updateStationery);
router.patch('/stationery/:id/status', toggleStationeryStatus);

// Print Pricing Management
router.get('/pricing', getPrintPrices);
router.put('/pricing', updatePrintPrices);

// System Settings Management (Deadlines, master switch, UPI info)
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Reports & Business Analytics
router.get('/reports', getReports);

// Razorpay Payment Transactions Audit & Extra Payment Review
router.get('/payments', getPaymentTransactions);
router.patch('/payments/:id/review-extra', reviewExtraPayment);

module.exports = router;
