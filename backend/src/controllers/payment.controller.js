const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/database');

/**
 * Initialize Razorpay instance
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are not configured in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).');
  }

  return new Razorpay({ key_id, key_secret });
};

/**
 * Public payment configuration
 * GET /api/payment/config
 */
const getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID || ''
  });
};

/**
 * Create a real Razorpay Order
 * POST /api/payment/create-order
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt, orderSummary } = req.body;
    const userId = req.user.id;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount. Minimum amount is ₹1.00.'
      });
    }

    // Convert amount to paise (e.g. ₹10.50 -> 1050 paise)
    const amountInPaise = Math.round(parsedAmount * 100);
    const receiptId = receipt || `rcpt_${Date.now()}_${userId}`;

    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptId.substring(0, 40),
      notes: {
        user_id: String(userId),
        user_email: req.user.email || '',
        platform: 'XeroXpress Campus Xerox'
      }
    };

    const rzpOrder = await razorpay.orders.create(orderOptions);

    // Save transaction state in database
    await pool.query(
      `INSERT INTO payment_transactions (user_id, razorpay_order_id, amount, currency, status, payment_method, receipt)
       VALUES (?, ?, ?, ?, 'CREATED', 'RAZORPAY', ?)`,
      [userId, rzpOrder.id, parsedAmount.toFixed(2), rzpOrder.currency, rzpOrder.receipt]
    );

    return res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        receipt: rzpOrder.receipt
      }
    });
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    next(error);
  }
};

/**
 * Verify Razorpay Signature
 * POST /api/payment/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required Razorpay verification parameters (order_id, payment_id, signature).'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Server Razorpay secret is not configured.'
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Mark transaction as failed
      await pool.query(
        `UPDATE payment_transactions
         SET status = 'FAILED', razorpay_payment_id = ?, razorpay_signature = ?
         WHERE razorpay_order_id = ?`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );

      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Payment verification failed: Invalid digital signature.'
      });
    }

    // Valid signature: Update transaction record to PAID
    await pool.query(
      `UPDATE payment_transactions
       SET status = 'PAID', razorpay_payment_id = ?, razorpay_signature = ?
       WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    return res.status(200).json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Razorpay payment signature verified successfully.'
    });
  } catch (error) {
    console.error('❌ Razorpay signature verification error:', error);
    next(error);
  }
};

/**
 * Handle Asynchronous Razorpay Webhooks
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ status: 'error', message: 'Missing signature or webhook secret' });
    }

    // Verify webhook payload
    const rawPayload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('⚠️ Razorpay webhook signature mismatch');
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const orderId = paymentEntity ? paymentEntity.order_id : null;
      const paymentId = paymentEntity ? paymentEntity.id : null;

      if (orderId) {
        await pool.query(
          `UPDATE payment_transactions
           SET status = 'PAID', razorpay_payment_id = COALESCE(?, razorpay_payment_id)
           WHERE razorpay_order_id = ?`,
          [paymentId, orderId]
        );

        // Also update orders/payments if already created
        if (paymentId) {
          await pool.query(
            `UPDATE payments
             SET payment_status = 'PAID', paid_at = NOW()
             WHERE transaction_reference = ?`,
            [paymentId]
          );
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const orderId = paymentEntity ? paymentEntity.order_id : null;
      if (orderId) {
        await pool.query(
          `UPDATE payment_transactions SET status = 'FAILED' WHERE razorpay_order_id = ?`,
          [orderId]
        );
      }
    }

    return res.status(200).json({ status: 'ok', event });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
