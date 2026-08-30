const { Achievement, StudentProfile } = require('../models');

// @desc    Get all achievements for authenticated student
// @route   GET /api/achievements
// @access  Private (Student)
const getAchievements = async (req, res) => {
  try {
    const studentId = req.user._id;
    const achievements = await Achievement.find({ studentId }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    console.error('[Achievement Controller - GetAchievements]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch achievements',
    });
  }
};

// @desc    Create a new achievement
// @route   POST /api/achievements
// @access  Private (Student)
const createAchievement = async (req, res) => {
  try {
    const { title, description, organization, date, proof, badgeUrl } = req.body;

    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Achievement title is required',
      });
    }

    const achievement = await Achievement.create({
      studentId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      organization: organization ? organization.trim() : '',
      date: date || new Date(),
      proof: proof ? proof.trim() : '',
      badgeUrl: badgeUrl ? badgeUrl.trim() : '',
    });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('achievementAdded', achievement);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('achievementAdded', achievement);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Achievement registered successfully',
      data: achievement,
    });
  } catch (error) {
    console.error('[Achievement Controller - CreateAchievement]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create achievement',
    });
  }
};

// @desc    Update an achievement
// @route   PUT /api/achievements/:id
// @access  Private (Student)
const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, organization, date, proof, badgeUrl } = req.body;

    const achievement = await Achievement.findOne({ _id: id, studentId: req.user._id });
    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found or unauthorized',
      });
    }

    if (title) achievement.title = title.trim();
    if (description !== undefined) achievement.description = description.trim();
    if (organization !== undefined) achievement.organization = organization.trim();
    if (date !== undefined) achievement.date = date;
    if (proof !== undefined) achievement.proof = proof.trim();
    if (badgeUrl !== undefined) achievement.badgeUrl = badgeUrl.trim();

    await achievement.save();

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('achievementUpdated', achievement);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('achievementUpdated', achievement);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Achievement updated successfully',
      data: achievement,
    });
  } catch (error) {
    console.error('[Achievement Controller - UpdateAchievement]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update achievement',
    });
  }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private (Student)
const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found or unauthorized',
      });
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('achievementDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('achievementDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Achievement deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Achievement Controller - DeleteAchievement]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete achievement',
    });
  }
};

module.exports = {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
