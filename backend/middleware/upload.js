const multer = require('multer');
const path = require('path');

// Cloud-native memory storage: eliminates filesystem permission issues (EACCES)
// and enables permanent storage in MongoDB Atlas
const storage = multer.memoryStorage();

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
