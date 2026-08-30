const express = require('express');
const router = express.Router();
const {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAchievements);
router.post('/', createAchievement);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

module.exports = router;
