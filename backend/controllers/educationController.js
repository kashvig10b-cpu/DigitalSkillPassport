const { Education, StudentProfile } = require('../models');

// @desc    Get all education records for authenticated student
// @route   GET /api/education
// @access  Private (Student)
const getEducation = async (req, res) => {
  try {
    const studentId = req.user._id;
    const records = await Education.find({ studentId }).sort({ startYear: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('[Education Controller - GetEducation]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch education records',
    });
  }
};

// @desc    Create a new education record
// @route   POST /api/education
// @access  Private (Student)
const createEducation = async (req, res) => {
  try {
    const {
      institution,
      degree,
      department,
      startYear,
      endYear,
      cgpa,
      description,
    } = req.body;

    if (!institution || !degree) {
      return res.status(400).json({
        status: 'error',
        message: 'Institution and degree are required',
      });
    }

    const record = await Education.create({
      studentId: req.user._id,
      institution: institution.trim(),
      degree: degree.trim(),
      department: department ? department.trim() : '',
      startYear: Number(startYear) || new Date().getFullYear(),
      endYear: endYear ? Number(endYear) : null,
      cgpa: cgpa ? Number(cgpa) : null,
      description: description ? description.trim() : '',
    });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('educationAdded', record);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('educationAdded', record);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Education record added successfully',
      data: record,
    });
  } catch (error) {
    console.error('[Education Controller - CreateEducation]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add education record',
    });
  }
};

// @desc    Update an education record
// @route   PUT /api/education/:id
// @access  Private (Student)
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      institution,
      degree,
      department,
      startYear,
      endYear,
      cgpa,
      description,
    } = req.body;

    const record = await Education.findOne({ _id: id, studentId: req.user._id });
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Education record not found or unauthorized',
      });
    }

    if (institution) record.institution = institution.trim();
    if (degree) record.degree = degree.trim();
    if (department !== undefined) record.department = department.trim();
    if (startYear !== undefined) record.startYear = Number(startYear);
    if (endYear !== undefined) record.endYear = endYear ? Number(endYear) : null;
    if (cgpa !== undefined) record.cgpa = cgpa ? Number(cgpa) : null;
    if (description !== undefined) record.description = description.trim();

    await record.save();

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('educationUpdated', record);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('educationUpdated', record);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Education record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('[Education Controller - UpdateEducation]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update education record',
    });
  }
};

// @desc    Delete an education record
// @route   DELETE /api/education/:id
// @access  Private (Student)
const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Education.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Education record not found or unauthorized',
      });
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('educationDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('educationDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Education record deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Education Controller - DeleteEducation]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete education record',
    });
  }
};

module.exports = {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
};
