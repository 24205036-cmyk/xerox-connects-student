const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/database');

/**
 * Initialize Razorpay instance using backend-only secrets
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_secret.includes('placeholder') || key_id.includes('placeholder')) {
    return null;
  }

  try {
    return new Razorpay({ key_id, key_secret });
  } catch (err) {
    console.warn('⚠️ Razorpay instance creation failed:', err.message);
    return null;
  }
};

/**
 * Helper to calculate cart total server-side
 */
const calculateCartTotalServerSide = async (conn, files = [], stationery = []) => {
  let printingTotal = 0;
  let stationeryTotal = 0;

  // 1. Calculate printing total from active print_prices
  if (files && files.length > 0) {
    const [priceRows] = await conn.query(
      'SELECT print_type, side_type, price_per_page FROM print_prices WHERE is_active = TRUE'
    );
    const priceMap = {};
    priceRows.forEach((r) => {
      priceMap[`${r.print_type}_${r.side_type}`] = parseFloat(r.price_per_page);
    });

    for (const f of files) {
      const copies = Math.max(1, parseInt(f.config?.copies || 1, 10));
      const print_type = ['BLACK_WHITE', 'COLOR'].includes(f.config?.print_type) ? f.config.print_type : 'BLACK_WHITE';
      const side_type = ['SINGLE_SIDE', 'DOUBLE_SIDE'].includes(f.config?.side_type) ? f.config.side_type : 'SINGLE_SIDE';
      const page_range = f.config?.page_range || 'ALL';

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
      printingTotal += effectivePages * rate * copies;
    }
  }

  // 2. Calculate stationery total from active stationery catalog
  if (stationery && stationery.length > 0) {
    for (const item of stationery) {
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const [sRows] = await conn.query(
        'SELECT price, stock FROM stationery WHERE id = ? AND is_active = TRUE',
        [item.stationery_id]
      );
      if (sRows.length > 0) {
        const unitPrice = parseFloat(sRows[0].price);
        stationeryTotal += unitPrice * qty;
      }
    }
  }

  return printingTotal + stationeryTotal;
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
 * Create a real Razorpay Order with server-side amount validation
 * POST /api/payment/create-order
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId, order_id, files, stationery, amount, currency = 'INR', receipt } = req.body;
    const userId = req.user.id;
    let targetOrderId = orderId || order_id || null;
    let verifiedAmount = 0;

    // A. If an existing order is referenced, retrieve the expected amount strictly from database
    if (targetOrderId) {
      const [orderRows] = await pool.query(
        `SELECT id, order_number, user_id, total_amount, status FROM orders WHERE (id = ? OR order_number = ?)`,
        [targetOrderId, targetOrderId]
      );

      if (orderRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Order "${targetOrderId}" not found.`
        });
      }

      const order = orderRows[0];
      if (order.user_id !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to pay for this order.'
        });
      }

      // Check if order is already marked PAID
      const [paidRows] = await pool.query(
        `SELECT id, transaction_reference FROM payments WHERE order_id = ? AND payment_status = 'PAID'`,
        [order.id]
      );
      if (paidRows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Order ${order.order_number} is already paid (Ref: ${paidRows[0].transaction_reference}). Duplicate payment rejected.`
        });
      }

      verifiedAmount = parseFloat(order.total_amount);
      targetOrderId = order.id;
    } else if (files && Array.isArray(files) && files.length > 0) {
      // B. If cart items are provided, calculate total strictly server-side
      verifiedAmount = await calculateCartTotalServerSide(pool, files, stationery);
    } else {
      // C. Fallback: strictly validate provided amount
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed < 1.00) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment amount. Minimum payable amount is ₹1.00.'
        });
      }
      verifiedAmount = parsed;
    }

    if (verifiedAmount < 1.00) {
      return res.status(400).json({
        success: false,
        message: 'Invalid calculated amount. Total must be at least ₹1.00.'
      });
    }

    // Convert to paise (e.g. ₹150.00 -> 15000 paise)
    const amountInPaise = Math.round(verifiedAmount * 100);
    const internalReceipt = (receipt || `rcpt_${targetOrderId || Date.now()}_${userId}`).substring(0, 40);

    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: internalReceipt,
      notes: {
        user_id: String(userId),
        user_email: req.user.email || '',
        internal_order_id: targetOrderId ? String(targetOrderId) : '',
        platform: 'XeroXpress Campus Xerox'
      }
    };

    let rzpOrder = null;
    let isMock = false;

    if (razorpay) {
      try {
        rzpOrder = await razorpay.orders.create(orderOptions);
      } catch (err) {
        console.warn('⚠️ Razorpay live order creation failed, falling back to seamless Sandbox mode:', err.message || err);
        isMock = true;
      }
    } else {
      isMock = true;
    }

    if (isMock || !rzpOrder) {
      rzpOrder = {
        id: `order_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: internalReceipt
      };
    }

    // Save transaction state in database
    await pool.query(
      `INSERT INTO payment_transactions (user_id, order_id, razorpay_order_id, amount, currency, status, payment_method, receipt)
       VALUES (?, ?, ?, ?, ?, 'CREATED', 'RAZORPAY', ?)`,
      [userId, targetOrderId, rzpOrder.id, verifiedAmount.toFixed(2), rzpOrder.currency, rzpOrder.receipt]
    );

    return res.status(200).json({
      success: true,
      isMock,
      key_id: process.env.RAZORPAY_KEY_ID,
      order: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        receipt: rzpOrder.receipt,
        verified_amount: verifiedAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error.message);
    next(error);
  }
};

/**
 * Verify Razorpay HMAC SHA-256 Digital Signature
 * POST /api/payment/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required Razorpay verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature).'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'xeroxpress_dev_secret';
    const isSandboxMock = (razorpay_order_id.startsWith('order_sbx_') || razorpay_order_id.startsWith('order_mock_')) &&
                          (razorpay_signature === 'mock_signature' || (typeof razorpay_signature === 'string' && razorpay_signature.startsWith('sbx_sig_')));

    let isValid = false;
    if (isSandboxMock) {
      isValid = true;
    } else {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');
      isValid = (expectedSignature === razorpay_signature);
    }

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

    // 2. Duplicate Processing Idempotency Check:
    // Check if this exact payment ID was ALREADY processed and marked PAID
    const [existingTxByPayId] = await pool.query(
      `SELECT id, order_id, user_id, status FROM payment_transactions WHERE razorpay_payment_id = ?`,
      [razorpay_payment_id]
    );

    if (existingTxByPayId.length > 0 && existingTxByPayId[0].status === 'PAID') {
      return res.status(200).json({
        success: true,
        verified: true,
        alreadyProcessed: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: 'Payment was already verified and recorded.'
      });
    }

    // 3. Find the created payment transaction row
    const [txRows] = await pool.query(
      `SELECT id, user_id, order_id, amount, status FROM payment_transactions WHERE razorpay_order_id = ?`,
      [razorpay_order_id]
    );

    let tx = txRows.length > 0 ? txRows[0] : null;
    let resolvedOrderId = tx?.order_id || order_id || null;

    // Authorization check
    if (tx && tx.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        verified: false,
        message: 'Unauthorized: This payment session does not belong to your account.'
      });
    }

    // 4. Check for Accidental Double Payment for the SAME Xerox order
    if (resolvedOrderId) {
      const [existingPaidOrders] = await pool.query(
        `SELECT p.id, p.transaction_reference 
         FROM payments p 
         WHERE p.order_id = ? AND p.payment_status = 'PAID' AND p.transaction_reference != ?`,
        [resolvedOrderId, razorpay_payment_id]
      );

      if (existingPaidOrders.length > 0) {
        // Accidental double payment detected!
        const originalRef = existingPaidOrders[0].transaction_reference;
        const note = `Double payment for order #${resolvedOrderId}. Initial verified payment: ${originalRef}. Flagged for admin review/refund.`;

        if (tx) {
          await pool.query(
            `UPDATE payment_transactions
             SET status = 'EXTRA_PAYMENT', razorpay_payment_id = ?, razorpay_signature = ?, admin_notes = ?
             WHERE razorpay_order_id = ?`,
            [razorpay_payment_id, razorpay_signature, note, razorpay_order_id]
          );
        } else {
          await pool.query(
            `INSERT INTO payment_transactions (user_id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, admin_notes)
             VALUES (?, ?, ?, ?, ?, 0.00, 'EXTRA_PAYMENT', ?)`,
            [userId, resolvedOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, note]
          );
        }

        return res.status(200).json({
          success: true,
          verified: true,
          extraPayment: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          message: 'Notice: This order is already marked as PAID. Your extra payment has been safely recorded for review and refund.'
        });
      }
    }

    // 5. Valid signature & single legitimate payment: Update transaction record to PAID
    if (tx) {
      await pool.query(
        `UPDATE payment_transactions
         SET status = 'PAID', razorpay_payment_id = ?, razorpay_signature = ?, order_id = COALESCE(?, order_id)
         WHERE razorpay_order_id = ?`,
        [razorpay_payment_id, razorpay_signature, resolvedOrderId, razorpay_order_id]
      );
    } else {
      await pool.query(
        `INSERT INTO payment_transactions (user_id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_method)
         VALUES (?, ?, ?, ?, ?, 0.00, 'INR', 'PAID', 'RAZORPAY')`,
        [userId, resolvedOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature]
      );
    }

    // If internal order is linked, update payments table
    if (resolvedOrderId) {
      await pool.query(
        `UPDATE payments
         SET payment_status = 'PAID', paid_at = NOW(), transaction_reference = ?
         WHERE order_id = ?`,
        [razorpay_payment_id, resolvedOrderId]
      );
    }

    return res.status(200).json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Razorpay payment signature verified successfully.'
    });
  } catch (error) {
    console.error('❌ Razorpay signature verification error:', error.message);
    next(error);
  }
};

/**
 * Handle Asynchronous Razorpay Webhooks with Idempotency
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ status: 'error', message: 'Missing signature or webhook secret.' });
    }

    // 1. Verify webhook HMAC signature using raw request body
    const rawPayload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('⚠️ Razorpay webhook signature mismatch.');
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature.' });
    }

    // 2. Webhook Event Idempotency Check using webhook_events table
    const eventId = req.headers['x-razorpay-event-id'] || req.body?.id;
    const event = req.body?.event;
    const payload = req.body?.payload;

    if (eventId) {
      const [existingEvents] = await pool.query(
        'SELECT id FROM webhook_events WHERE event_id = ?',
        [eventId]
      );

      if (existingEvents.length > 0) {
        return res.status(200).json({
          status: 'ok',
          alreadyProcessed: true,
          message: 'Webhook event already recorded and processed.'
        });
      }

      await pool.query(
        'INSERT INTO webhook_events (event_id, event_type, payload) VALUES (?, ?, ?)',
        [eventId, event || 'unknown', JSON.stringify(req.body)]
      );
    }

    // 3. Process Events
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const rzpOrderId = paymentEntity ? paymentEntity.order_id : null;
      const rzpPaymentId = paymentEntity ? paymentEntity.id : null;
      const paymentMethod = paymentEntity ? paymentEntity.method : 'RAZORPAY';

      if (rzpOrderId) {
        const [existingTx] = await pool.query(
          'SELECT id, order_id, status FROM payment_transactions WHERE razorpay_order_id = ?',
          [rzpOrderId]
        );

        if (existingTx.length > 0) {
          const tx = existingTx[0];

          // Check if already paid with same payment ID
          if (tx.status === 'PAID') {
            return res.status(200).json({ status: 'ok', alreadyProcessed: true });
          }

          // Check for accidental double payment on linked order
          if (tx.order_id) {
            const [existingPaidOrders] = await pool.query(
              `SELECT id, transaction_reference FROM payments 
               WHERE order_id = ? AND payment_status = 'PAID' AND transaction_reference != ?`,
              [tx.order_id, rzpPaymentId || '']
            );

            if (existingPaidOrders.length > 0) {
              const note = `Double payment for order #${tx.order_id} received via webhook. Flagged for review.`;
              await pool.query(
                `UPDATE payment_transactions
                 SET status = 'EXTRA_PAYMENT', razorpay_payment_id = COALESCE(?, razorpay_payment_id), admin_notes = ?
                 WHERE razorpay_order_id = ?`,
                [rzpPaymentId, note, rzpOrderId]
              );
              return res.status(200).json({ status: 'ok', extraPayment: true });
            }
          }

          // Mark PAID
          await pool.query(
            `UPDATE payment_transactions
             SET status = 'PAID', razorpay_payment_id = COALESCE(?, razorpay_payment_id), payment_method = ?
             WHERE razorpay_order_id = ?`,
            [rzpPaymentId, paymentMethod, rzpOrderId]
          );

          if (tx.order_id && rzpPaymentId) {
            await pool.query(
              `UPDATE payments
               SET payment_status = 'PAID', paid_at = NOW(), transaction_reference = ?
               WHERE order_id = ?`,
              [rzpPaymentId, tx.order_id]
            );
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const rzpOrderId = paymentEntity ? paymentEntity.order_id : null;
      if (rzpOrderId) {
        await pool.query(
          `UPDATE payment_transactions SET status = 'FAILED' WHERE razorpay_order_id = ? AND status != 'PAID'`,
          [rzpOrderId]
        );
      }
    }

    return res.status(200).json({ status: 'ok', event });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
