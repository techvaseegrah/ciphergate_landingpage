const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── ID Proof Upload Middleware ──────────────────────────────────────────────
// Accepted MIME types for ID proof documents
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure the upload directory exists
const idProofDir = path.join(__dirname, '../uploads/id-proofs');
if (!fs.existsSync(idProofDir)) {
  fs.mkdirSync(idProofDir, { recursive: true });
}

const idProofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, idProofDir);
  },
  filename: (req, file, cb) => {
    const workerId = req.params?.id || 'new';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `idproof-${workerId}-${timestamp}${ext}`);
  }
});

const idProofFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Excel files are allowed.'), false);
  }
};

const uploadIdProof = multer({
  storage: idProofStorage,
  fileFilter: idProofFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = { uploadIdProof };
