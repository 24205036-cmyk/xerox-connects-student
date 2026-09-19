const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  handleWebhook
} = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');

// Public endpoint to get Razorpay key ID for checkout initialization
router.get('/config', getPaymentConfig);

// Authenticated endpoint to create Razorpay order with server-side validation
router.post('/create-order', authenticateToken, createPaymentOrder);

// Authenticated endpoint to verify Razorpay digital HMAC signature
router.post('/verify', authenticateToken, verifyPayment);

// Razorpay Webhook endpoint for asynchronous payment updates
router.post('/webhook', handleWebhook);

module.exports = router;
