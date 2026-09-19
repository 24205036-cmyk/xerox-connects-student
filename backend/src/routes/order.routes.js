const express = require('express');
const router = express.Router();
const {
  uploadFiles,
  getPrintPrices,
  getStationery,
  deleteDraftFile,
  createOrder,
  cancelOrder,
  getStudentOrderDetail,
  getStudentOrderHistory
} = require('../controllers/order.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public price discovery
router.get('/prices', getPrintPrices);

// Stationery catalog (authenticated students)
router.get('/stationery', authenticateToken, getStationery);

// Student PDF upload (max 10 files)
router.post(
  '/upload',
  authenticateToken,
  requireRole('STUDENT'),
  upload.array('files', 10),
  uploadFiles
);

// Delete draft uploaded PDF
router.delete(
  '/upload/:filename',
  authenticateToken,
  requireRole('STUDENT'),
  deleteDraftFile
);

// Create a full order
router.post(
  '/',
  authenticateToken,
  requireRole('STUDENT'),
  createOrder
);

// Student order history (must come before /:id)
router.get(
  '/history',
  authenticateToken,
  requireRole('STUDENT'),
  getStudentOrderHistory
);

// Cancel a PENDING order (student only)
router.patch(
  '/:id/cancel',
  authenticateToken,
  requireRole('STUDENT'),
  cancelOrder
);

// Student order detail
router.get(
  '/:id',
  authenticateToken,
  requireRole('STUDENT'),
  getStudentOrderDetail
);

module.exports = router;
