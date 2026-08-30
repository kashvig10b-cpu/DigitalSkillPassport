const express = require('express');
const router = express.Router();
const {
  searchCandidates,
  getFilterOptions,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('recruiter', 'admin'));

router.get('/search', searchCandidates);
router.get('/filters', getFilterOptions);

module.exports = router;
