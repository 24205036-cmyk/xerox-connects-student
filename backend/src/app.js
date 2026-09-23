const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const orderRoutes = require('./routes/order.routes');
const staffRoutes = require('./routes/staff.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const converterRoutes = require('./routes/converter.routes');
const paymentRoutes = require('./routes/payment.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { authRateLimiter, converterRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// Global Middlewares
const rawOrigins = process.env.FRONTEND_URL || '*';
const allowedOrigins = rawOrigins.split(',').map((url) => url.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, uptime monitors)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel preview deployment for this project if vercel.app is permitted
    if (allowedOrigins.some((allowed) => allowed.includes('vercel.app')) && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Base API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/converter', converterRateLimiter, converterRoutes);
app.use('/api/payment', paymentRoutes);



// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'XeroXpress API',
    tagline: 'Upload. Print. Collect.',
    healthCheck: '/api/health',
    status: 'Running'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
