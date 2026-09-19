const express = require('express');
const router = express.Router();
const { getDashboardSummary, getProfile, updateProfile } = require('../controllers/student.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all student routes
router.use(authenticateToken);
router.use(requireRole('STUDENT'));

router.get('/dashboard', getDashboardSummary);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
