const express = require('express');
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getCertificates);
router.post('/', upload.single('file'), createCertificate);
router.put('/:id', upload.single('file'), updateCertificate);
router.delete('/:id', deleteCertificate);

module.exports = router;
