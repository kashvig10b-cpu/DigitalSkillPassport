const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminCertificates,
  verifyCertificate,
  rejectCertificate,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/certificates', getAdminCertificates);
router.put('/certificates/:id/verify', verifyCertificate);
router.put('/certificates/:id/reject', rejectCertificate);

module.exports = router;
