const crypto = require('crypto');
require('dotenv').config();
const { pool } = require('./src/config/database');
const initDatabase = require('./src/config/initDb');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xeroxpress_jwt_secret_dev_key_2026_super_secure';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

async function runRazorpayVerificationTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING PRODUCTION RAZORPAY VERIFICATION & SECURITY TEST SUITE');
  console.log('================================================================\n');

  // Ensure database is initialized with updated schema
  await initDatabase();

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Authenticate Student
  const [students] = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'STUDENT' LIMIT 1");
  if (students.length === 0) {
    throw new Error('No student found in database for test.');
  }
  const student = students[0];
  const studentToken = jwt.sign(
    { id: student.id, email: student.email, role: student.role, name: student.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log(`✔ Authenticated Test Student: ${student.name} (ID: ${student.id})`);

  // Helper for authenticated requests
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${studentToken}`
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Normal Payment Flow
  // Customer A -> Order A -> Payment A -> SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 1] Normal Payment Flow & Server-Side Verification ---');
  const rzpOrderId1 = `order_test_${Date.now()}_1`;
  const rzpPaymentId1 = `pay_test_${Date.now()}_1`;
  const amount1 = 15.00;

  // Insert payment transaction as CREATED
  await pool.query(
    `INSERT INTO payment_transactions (user_id, razorpay_order_id, amount, currency, status, payment_method)
     VALUES (?, ?, ?, 'INR', 'CREATED', 'RAZORPAY')`,
    [student.id, rzpOrderId1, amount1]
  );

  // Generate valid HMAC signature
  const validSignature1 = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${rzpOrderId1}|${rzpPaymentId1}`)
    .digest('hex');

  // Verify payment via /api/payment/verify
  const verifyRes1 = await fetch(`${BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: rzpOrderId1,
      razorpay_payment_id: rzpPaymentId1,
      razorpay_signature: validSignature1
    })
  }).then(r => r.json());

  console.log('Verification Response 1:', verifyRes1);
  if (!verifyRes1.success || !verifyRes1.verified || verifyRes1.payment_id !== rzpPaymentId1) {
    throw new Error('TEST 1 Failed: Normal signature verification failed.');
  }

  // Create Xerox print order using the verified payment
  const orderRes1 = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      files: [{
        original_name: 'assignment1.pdf',
        stored_filename: 'assignment1.pdf',
        page_count: 10,
        config: { copies: 1, print_type: 'BLACK_WHITE', side_type: 'SINGLE_SIDE', page_range: 'ALL' }
      }],
      stationery: [],
      payment_reference: rzpPaymentId1,
      razorpay_order_id: rzpOrderId1,
      payment_method: 'RAZORPAY',
      payment_status: 'PAID'
    })
  }).then(r => r.json());

  console.log('Order Placement 1:', orderRes1.status, '| Order Number:', orderRes1.order?.order_number);
  if (orderRes1.status !== 'success') {
    throw new Error(`TEST 1 Failed: Order placement rejected: ${orderRes1.message}`);
  }
  const createdOrderId1 = orderRes1.order.id;
  console.log('✔ [TEST 1 PASSED]: Single order successfully paid and queued.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Same Customer Can Make Multiple Legitimate Payments
  // Customer A -> Order B -> Payment B -> SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 2] Same Customer Multiple Legitimate Payments ---');
  const rzpOrderId2 = `order_test_${Date.now()}_2`;
  const rzpPaymentId2 = `pay_test_${Date.now()}_2`;
  const amount2 = 30.00;

  await pool.query(
    `INSERT INTO payment_transactions (user_id, razorpay_order_id, amount, currency, status, payment_method)
     VALUES (?, ?, ?, 'INR', 'CREATED', 'RAZORPAY')`,
    [student.id, rzpOrderId2, amount2]
  );

  const validSignature2 = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${rzpOrderId2}|${rzpPaymentId2}`)
    .digest('hex');

  const verifyRes2 = await fetch(`${BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: rzpOrderId2,
      razorpay_payment_id: rzpPaymentId2,
      razorpay_signature: validSignature2
    })
  }).then(r => r.json());

  if (!verifyRes2.success || !verifyRes2.verified) {
    throw new Error('TEST 2 Failed: Second payment verification failed.');
  }

  const orderRes2 = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      files: [{
        original_name: 'lab_record2.pdf',
        stored_filename: 'lab_record2.pdf',
        page_count: 20,
        config: { copies: 1, print_type: 'BLACK_WHITE', side_type: 'SINGLE_SIDE', page_range: 'ALL' }
      }],
      stationery: [],
      payment_reference: rzpPaymentId2,
      razorpay_order_id: rzpOrderId2,
      payment_method: 'RAZORPAY',
      payment_status: 'PAID'
    })
  }).then(r => r.json());

  console.log('Order Placement 2:', orderRes2.status, '| Order Number:', orderRes2.order?.order_number);
  if (orderRes2.status !== 'success') {
    throw new Error(`TEST 2 Failed: Second order creation failed: ${orderRes2.message}`);
  }
  console.log('✔ [TEST 2 PASSED]: Same student placed 2 independent legitimate orders successfully.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Duplicate Processing Idempotency
  // Same payment ID received twice -> Handled idempotently
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 3] Duplicate Processing Idempotency ---');
  const verifyRes3 = await fetch(`${BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: rzpOrderId1,
      razorpay_payment_id: rzpPaymentId1,
      razorpay_signature: validSignature1
    })
  }).then(r => r.json());

  console.log('Duplicate Verification Response:', verifyRes3);
  if (!verifyRes3.success || !verifyRes3.alreadyProcessed) {
    throw new Error('TEST 3 Failed: Repeated payment verification did not return idempotent alreadyProcessed.');
  }
  console.log('✔ [TEST 3 PASSED]: Duplicate payment verification handled idempotently.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Accidental Double Payment for the SAME Order
  // Customer pays Order 1 again -> Status EXTRA_PAYMENT, no second print order
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 4] Accidental Double Payment for Same Order ---');
  const rzpOrderId4 = `order_test_${Date.now()}_4`;
  const rzpPaymentId4 = `pay_test_${Date.now()}_4`;

  // Pre-link order_id to createdOrderId1 (which is already PAID)
  await pool.query(
    `INSERT INTO payment_transactions (user_id, order_id, razorpay_order_id, amount, currency, status, payment_method)
     VALUES (?, ?, ?, 15.00, 'INR', 'CREATED', 'RAZORPAY')`,
    [student.id, createdOrderId1, rzpOrderId4]
  );

  const validSignature4 = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${rzpOrderId4}|${rzpPaymentId4}`)
    .digest('hex');

  const verifyRes4 = await fetch(`${BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: rzpOrderId4,
      razorpay_payment_id: rzpPaymentId4,
      razorpay_signature: validSignature4,
      order_id: createdOrderId1
    })
  }).then(r => r.json());

  console.log('Accidental Double Payment Response:', verifyRes4);
  if (!verifyRes4.extraPayment) {
    throw new Error('TEST 4 Failed: System failed to detect accidental double payment for already-paid order.');
  }

  // Check database status
  const [checkExtra] = await pool.query(
    'SELECT status, admin_notes FROM payment_transactions WHERE razorpay_payment_id = ?',
    [rzpPaymentId4]
  );
  if (checkExtra.length === 0 || checkExtra[0].status !== 'EXTRA_PAYMENT') {
    throw new Error('TEST 4 Failed: Database transaction status was not marked EXTRA_PAYMENT.');
  }
  console.log('✔ [TEST 4 PASSED]: Accidental double payment marked EXTRA_PAYMENT for admin review. No duplicate print job created.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Failed Payment Event
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 5] Payment Failure Handling ---');
  const rzpOrderId5 = `order_test_${Date.now()}_5`;
  await pool.query(
    `INSERT INTO payment_transactions (user_id, razorpay_order_id, amount, currency, status, payment_method)
     VALUES (?, ?, 20.00, 'INR', 'CREATED', 'RAZORPAY')`,
    [student.id, rzpOrderId5]
  );

  // Webhook payload for payment.failed
  const webhookPayload5 = {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: `pay_fail_${Date.now()}`,
          order_id: rzpOrderId5,
          amount: 2000,
          status: 'failed'
        }
      }
    }
  };
  const rawBody5 = JSON.stringify(webhookPayload5);
  const webhookSig5 = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody5).digest('hex');

  const webhookRes5 = await fetch(`${BASE_URL}/payment/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': webhookSig5,
      'x-razorpay-event-id': `evt_fail_${Date.now()}`
    },
    body: rawBody5
  }).then(r => r.json());

  const [checkFailed] = await pool.query(
    'SELECT status FROM payment_transactions WHERE razorpay_order_id = ?',
    [rzpOrderId5]
  );
  if (checkFailed[0].status !== 'FAILED') {
    throw new Error('TEST 5 Failed: Failed payment event did not set status to FAILED.');
  }
  console.log('✔ [TEST 5 PASSED]: Failed payment correctly updated to FAILED in database.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Tampered / Invalid Digital Signature Rejection
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 6] Invalid Digital Signature Rejection ---');
  const invalidSigRes = await fetch(`${BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      razorpay_order_id: `order_fake_${Date.now()}`,
      razorpay_payment_id: `pay_fake_${Date.now()}`,
      razorpay_signature: 'tampered_or_fake_hmac_signature'
    })
  });

  const invalidJson = await invalidSigRes.json();
  console.log('Invalid Signature Status:', invalidSigRes.status, '| Response:', invalidJson);
  if (invalidSigRes.status !== 400 || invalidJson.verified !== false) {
    throw new Error('TEST 6 Failed: Invalid signature was not rejected with HTTP 400.');
  }
  console.log('✔ [TEST 6 PASSED]: Fake / tampered HMAC signature rejected by backend.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Amount Tampering Protection
  // Attempting to use a ₹5 payment for a ₹50 order
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 7] Amount Tampering Protection ---');
  const rzpOrderId7 = `order_test_${Date.now()}_7`;
  const rzpPaymentId7 = `pay_test_${Date.now()}_7`;

  // Paid only ₹1.50
  await pool.query(
    `INSERT INTO payment_transactions (user_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, payment_method)
     VALUES (?, ?, ?, 1.50, 'INR', 'PAID', 'RAZORPAY')`,
    [student.id, rzpOrderId7, rzpPaymentId7]
  );

  // But student submits order calculated to ₹15.00
  const tamperedOrderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      files: [{
        original_name: 'tampered.pdf',
        stored_filename: 'tampered.pdf',
        page_count: 10,
        config: { copies: 1, print_type: 'BLACK_WHITE', side_type: 'SINGLE_SIDE', page_range: 'ALL' }
      }],
      stationery: [],
      payment_reference: rzpPaymentId7,
      razorpay_order_id: rzpOrderId7,
      payment_method: 'RAZORPAY',
      payment_status: 'PAID'
    })
  });
  const tamperedJson = await tamperedOrderRes.json();
  console.log('Amount Tampering Rejection:', tamperedOrderRes.status, '| Message:', tamperedJson.message);
  if (tamperedOrderRes.status !== 400) {
    throw new Error('TEST 7 Failed: Order with mismatched payment amount was not rejected.');
  }
  console.log('✔ [TEST 7 PASSED]: Amount tampering detected and blocked.');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: Unpaid / Reused Payment Order Creation Block
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 8] Unpaid Order & Reused Payment Blocking ---');
  // Attempt to reuse rzpPaymentId1 which was already used for createdOrderId1
  const reusedOrderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      files: [{
        original_name: 'reused.pdf',
        stored_filename: 'reused.pdf',
        page_count: 10,
        config: { copies: 1, print_type: 'BLACK_WHITE', side_type: 'SINGLE_SIDE', page_range: 'ALL' }
      }],
      stationery: [],
      payment_reference: rzpPaymentId1,
      payment_method: 'RAZORPAY',
      payment_status: 'PAID'
    })
  });
  const reusedJson = await reusedOrderRes.json();
  console.log('Reused Payment Status:', reusedOrderRes.status, '| Message:', reusedJson.message);
  if (reusedOrderRes.status !== 400) {
    throw new Error('TEST 8 Failed: Reused payment ID was not rejected.');
  }
  console.log('✔ [TEST 8 PASSED]: Payment reuse blocked. No duplicate print job released.');

  console.log('\n================================================================');
  console.log('🎉 ALL 8 RAZORPAY VERIFICATION & SECURITY TESTS PASSED PERFECTLY!');
  console.log('================================================================');
}

if (require.main === module) {
  runRazorpayVerificationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Test execution failure:', err);
      process.exit(1);
    });
}

module.exports = runRazorpayVerificationTests;
