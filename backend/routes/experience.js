const express = require('express');
const router = express.Router();
const {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getExperience);
router.post('/', createExperience);
router.put('/:id', updateExperience);
router.delete('/:id', deleteExperience);

module.exports = router;
