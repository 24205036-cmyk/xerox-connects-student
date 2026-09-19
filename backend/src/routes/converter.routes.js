const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  uploadMiddleware, 
  handlePdfToWord, 
  handleWordToPdf 
} = require('../controllers/converter.controller');

// Require authentication for all document conversions
router.use(authenticateToken);

// PDF -> Word conversion endpoint
router.post('/pdf-to-word', uploadMiddleware, handlePdfToWord);

// Word -> PDF conversion endpoint
router.post('/word-to-pdf', uploadMiddleware, handleWordToPdf);

module.exports = router;
