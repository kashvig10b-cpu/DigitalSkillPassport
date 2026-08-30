const express = require('express');
const router = express.Router();
const { getPublicPassport } = require('../controllers/passportController');

// Public route for phone camera QR code scanning & recruiter link inspection
router.get('/:passportId', getPublicPassport);

module.exports = router;
