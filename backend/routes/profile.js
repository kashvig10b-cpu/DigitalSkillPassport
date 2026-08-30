const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/resume', protect, upload.single('file'), uploadResume);
router.delete('/resume', protect, deleteResume);

module.exports = router;
