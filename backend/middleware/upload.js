const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    cb(null, `doc-${uniqueSuffix}-${cleanBaseName}${ext}`);
  },
});

// File filter validation: PDF, PNG, JPG, JPEG, WEBP, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|png|jpg|jpeg|webp|doc|docx/;
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (extName) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, PNG, JPG, WEBP, and DOC/DOCX files under 10MB are allowed!'), false);
  }
};

// 10MB limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
