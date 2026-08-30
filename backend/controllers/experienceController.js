const { Experience, StudentProfile } = require('../models');

// @desc    Get all experiences for authenticated student
// @route   GET /api/experience
// @access  Private (Student)
const getExperience = async (req, res) => {
  try {
    const studentId = req.user._id;
    const experiences = await Experience.find({ studentId }).sort({ startDate: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error('[Experience Controller - GetExperience]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch experience records',
    });
  }
};

// @desc    Create a new experience record
// @route   POST /api/experience
// @access  Private (Student)
const createExperience = async (req, res) => {
  try {
    const {
      company,
      jobTitle,
      employmentType,
      location,
      startDate,
      endDate,
      current,
      description,
      skills,
    } = req.body;

    if (!company || !jobTitle) {
      return res.status(400).json({
        status: 'error',
        message: 'Company and job title are required',
      });
    }

    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const experience = await Experience.create({
      studentId: req.user._id,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      employmentType: employmentType || 'Internship',
      location: location ? location.trim() : '',
      startDate: startDate || new Date(),
      endDate: current ? null : endDate || null,
      current: !!current,
      description: description ? description.trim() : '',
      skills: skillsArray,
    });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('experienceAdded', experience);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('experienceAdded', experience);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Work experience added successfully',
      data: experience,
    });
  } catch (error) {
    console.error('[Experience Controller - CreateExperience]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add experience record',
    });
  }
};

// @desc    Update an experience record
// @route   PUT /api/experience/:id
// @access  Private (Student)
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company,
      jobTitle,
      employmentType,
      location,
      startDate,
      endDate,
      current,
      description,
      skills,
    } = req.body;

    const experience = await Experience.findOne({ _id: id, studentId: req.user._id });
    if (!experience) {
      return res.status(404).json({
        status: 'error',
        message: 'Experience record not found or unauthorized',
      });
    }

    if (company) experience.company = company.trim();
    if (jobTitle) experience.jobTitle = jobTitle.trim();
    if (employmentType) experience.employmentType = employmentType;
    if (location !== undefined) experience.location = location.trim();
    if (startDate !== undefined) experience.startDate = startDate;
    if (current !== undefined) {
      experience.current = !!current;
      if (experience.current) experience.endDate = null;
    }
    if (!experience.current && endDate !== undefined) {
      experience.endDate = endDate;
    }
    if (description !== undefined) experience.description = description.trim();
    if (skills !== undefined) {
      experience.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await experience.save();

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('experienceUpdated', experience);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('experienceUpdated', experience);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Experience record updated successfully',
      data: experience,
    });
  } catch (error) {
    console.error('[Experience Controller - UpdateExperience]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update experience record',
    });
  }
};

// @desc    Delete an experience record
// @route   DELETE /api/experience/:id
// @access  Private (Student)
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!experience) {
      return res.status(404).json({
        status: 'error',
        message: 'Experience record not found or unauthorized',
      });
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('experienceDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('experienceDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Experience record deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Experience Controller - DeleteExperience]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete experience record',
    });
  }
};

module.exports = {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
};
