const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { convertPdfToWord, convertWordToPdf, cleanupFile } = require('../services/documentConverter.service');

const TEMP_DIR = path.resolve('uploads/temp_conversions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_CONVERSION_FILE_SIZE, 10) || 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${crypto.randomUUID()}${ext}`);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('file');

/**
 * PDF -> Word Controller
 * POST /api/converter/pdf-to-word
 */
const handlePdfToWord = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      status: 'error',
      message: 'No PDF file was uploaded.'
    });
  }

  const ext = path.extname(uploadedFile.originalname).toLowerCase();
  if (ext !== '.pdf') {
    await cleanupFile(uploadedFile.path);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid file format. Only .pdf files are accepted for PDF → Word conversion.'
    });
  }

  try {
    const convertedResult = await convertPdfToWord(uploadedFile.path, uploadedFile.originalname);

    // Clean up uploaded input file immediately
    cleanupFile(uploadedFile.path);

    // Send converted .docx in-memory buffer directly
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(convertedResult.outputFilename)}"`,
      'Content-Length': convertedResult.buffer.length
    });

    return res.status(200).send(convertedResult.buffer);
  } catch (err) {
    cleanupFile(uploadedFile.path);
    console.error('PDF to Word Conversion Error:', err.message);
    return res.status(422).json({
      status: 'error',
      message: err.message || 'Unable to convert PDF document. Please check that the file is not corrupted or password protected.'
    });
  }
};

/**
 * Word -> PDF Controller
 * POST /api/converter/word-to-pdf
 */
const handleWordToPdf = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      status: 'error',
      message: 'No Word document was uploaded.'
    });
  }

  const ext = path.extname(uploadedFile.originalname).toLowerCase();
  if (ext !== '.doc' && ext !== '.docx') {
    await cleanupFile(uploadedFile.path);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid file format. Only .doc and .docx files are accepted for Word → PDF conversion.'
    });
  }

  try {
    const convertedResult = await convertWordToPdf(uploadedFile.path, uploadedFile.originalname);

    // Clean up uploaded input file immediately
    cleanupFile(uploadedFile.path);

    // Send converted .pdf in-memory buffer directly
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(convertedResult.outputFilename)}"`,
      'Content-Length': convertedResult.buffer.length
    });

    return res.status(200).send(convertedResult.buffer);
  } catch (err) {
    cleanupFile(uploadedFile.path);
    console.error('Word to PDF Conversion Error:', err.message);
    return res.status(422).json({
      status: 'error',
      message: err.message || 'Unable to convert Word document. Please ensure it is a valid .docx or modern Word file.'
    });
  }
};

module.exports = {
  uploadMiddleware,
  handlePdfToWord,
  handleWordToPdf
};
