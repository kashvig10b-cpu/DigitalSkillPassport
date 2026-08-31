const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminCertificates,
  verifyCertificate,
  rejectCertificate,
  getAdminRecruiters,
  approveRecruiter,
  rejectRecruiter,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Accreditation & Certificate Queue
router.get('/stats', getAdminStats);
router.get('/certificates', getAdminCertificates);
router.put('/certificates/:id/verify', verifyCertificate);
router.put('/certificates/:id/reject', rejectCertificate);

// Recruiter Security Review & Approval Queue
router.get('/recruiters', getAdminRecruiters);
router.put('/recruiters/:id/approve', approveRecruiter);
router.put('/recruiters/:id/reject', rejectRecruiter);

module.exports = router;
