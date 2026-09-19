const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/database');

/**
 * @route   GET /api/health
 * @desc    System health check & MySQL database connectivity status
 * @access  Public
 */
router.get('/', async (req, res) => {
  const dbHealth = await testConnection();

  return res.status(dbHealth.success ? 200 : 503).json({
    status: dbHealth.success ? 'success' : 'degraded',
    message: dbHealth.success 
      ? 'XeroXpress API and MySQL Database are fully operational.' 
      : 'API is running but Database connection is degraded.',
    timestamp: new Date().toISOString(),
    platform: {
      name: 'XeroXpress — College Xerox, Printing & Stationery Platform',
      version: '1.0.0',
      tagline: 'Upload. Print. Collect.',
      environment: process.env.NODE_ENV || 'development'
    },
    database: {
      status: dbHealth.success ? 'connected' : 'error',
      details: dbHealth.success ? 'MySQL 8+/MariaDB Pool Active' : dbHealth.error
    }
  });
});

module.exports = router;
