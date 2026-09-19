const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine with sanitized, unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique random hash + timestamp
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const extension = path.extname(sanitizedOriginal).toLowerCase() || '.pdf';
    const baseName = path.basename(sanitizedOriginal, extension).substring(0, 30);
    
    cb(null, `doc-${timestamp}-${randomSuffix}-${baseName}${extension}`);
  }
});

// File filter strictly for PDF documents
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only standard PDF (.pdf) documents are accepted.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Multer upload instance: max 50MB per file, up to 10 files per upload batch
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
    files: 10 // max 10 files per order
  }
});

module.exports = upload;
