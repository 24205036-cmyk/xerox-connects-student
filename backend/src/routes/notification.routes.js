const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');

// All authenticated users can access their notifications
router.use(authenticateToken);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
