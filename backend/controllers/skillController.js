const { Skill, StudentProfile } = require('../models');

// @desc    Get all skills for authenticated student
// @route   GET /api/skills
// @access  Private (Student)
const getSkills = async (req, res) => {
  try {
    const studentId = req.user._id;
    const skills = await Skill.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error('[Skill Controller - GetSkills]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch skills',
    });
  }
};

// @desc    Add a new skill
// @route   POST /api/skills
// @access  Private (Student)
const createSkill = async (req, res) => {
  try {
    const { name, category, level, yearsOfExperience } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Skill name is required',
      });
    }

    // Check if duplicate skill name already exists for this student
    const existing = await Skill.findOne({
      studentId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `You have already added '${name}' to your skill set`,
      });
    }

    const skill = await Skill.create({
      studentId: req.user._id,
      name: name.trim(),
      category: category || 'Programming',
      level: level || 'Intermediate',
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
      verified: false,
    });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('skillAdded', skill);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('skillAdded', skill);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Skill added successfully',
      data: skill,
    });
  } catch (error) {
    console.error('[Skill Controller - CreateSkill]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create skill',
    });
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private (Student)
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level, yearsOfExperience } = req.body;

    const skill = await Skill.findOne({ _id: id, studentId: req.user._id });
    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found or unauthorized',
      });
    }

    if (name) skill.name = name.trim();
    if (category) skill.category = category;
    if (level) skill.level = level;
    if (yearsOfExperience !== undefined) skill.yearsOfExperience = Number(yearsOfExperience);

    await skill.save();

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('skillUpdated', skill);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('skillUpdated', skill);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    console.error('[Skill Controller - UpdateSkill]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update skill',
    });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private (Student)
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found or unauthorized',
      });
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('skillDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('skillDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Skill deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Skill Controller - DeleteSkill]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete skill',
    });
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
