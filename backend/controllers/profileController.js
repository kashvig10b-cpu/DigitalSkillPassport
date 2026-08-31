const {
  User,
  StudentProfile,
  Skill,
  Project,
  Certificate,
  Achievement,
  Education,
  Experience,
  FileAttachment,
} = require('../models');
const path = require('path');

// Helper to calculate profile completion from real MongoDB data
const calculateProfileCompletion = async (user, profile, studentId) => {
  const [skillsCount, projectsCount, certsCount, achieveCount, eduCount] = await Promise.all([
    Skill.countDocuments({ studentId }),
    Project.countDocuments({ studentId }),
    Certificate.countDocuments({ studentId }),
    Achievement.countDocuments({ studentId }),
    Education.countDocuments({ studentId }),
  ]);

  const checks = [
    { label: 'Profile Photo', completed: !!user.profilePhoto, weight: 10 },
    { label: 'Personal Bio', completed: !!(profile.bio && profile.bio.trim().length > 10), weight: 10 },
    { label: 'Contact Details (Phone & Location)', completed: !!(profile.phone && profile.location), weight: 10 },
    { label: 'Academics (Degree & Department)', completed: !!(profile.degree && profile.department), weight: 15 },
    { label: 'Education History', completed: eduCount > 0, weight: 15 },
    { label: 'Skills Added', completed: skillsCount > 0, weight: 15 },
    { label: 'Projects Added', completed: projectsCount > 0, weight: 15 },
    { label: 'Certificates or Resume', completed: certsCount > 0 || !!profile.resume, weight: 10 },
  ];

  const totalScore = checks.reduce((acc, item) => acc + (item.completed ? item.weight : 0), 0);
  const percentage = Math.min(100, Math.round(totalScore));

  if (profile && profile.save && profile.profileCompletion !== percentage) {
    profile.profileCompletion = percentage;
    await profile.save().catch(() => {});
  }

  return {
    percentage,
    checklist: checks,
    counts: {
      totalSkills: skillsCount,
      totalProjects: projectsCount,
      totalCertificates: certsCount,
      totalAchievements: achieveCount,
      totalEducation: eduCount,
    },
  };
};

// @desc    Get current student's full profile and dashboard metrics
// @route   GET /api/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    let profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile && user.role === 'student') {
      const passportId = StudentProfile.generatePassportId(user.name);
      profile = await StudentProfile.create({
        userId: user._id,
        passportId,
        resume: user.resume || '',
      });
    }

    if (profile) {
      if (!profile.resume && user.resume) {
        profile.resume = user.resume;
        await profile.save().catch(() => {});
      } else if (profile.resume && !user.resume) {
        user.resume = profile.resume;
        await user.save().catch(() => {});
      }
    }

    // Fetch verified credentials count
    const verifiedCredentialsCount = await Certificate.countDocuments({
      studentId: user._id,
      status: 'VERIFIED',
    });

    const completionData = await calculateProfileCompletion(user, profile || {}, user._id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          profilePhoto: user.profilePhoto,
          role: user.role,
          resume: profile?.resume || user.resume || '',
        },
        profile: profile || {},
        stats: {
          profileCompletion: completionData.percentage,
          checklist: completionData.checklist,
          totalSkills: completionData.counts.totalSkills,
          totalProjects: completionData.counts.totalProjects,
          totalCertificates: completionData.counts.totalCertificates,
          totalAchievements: completionData.counts.totalAchievements,
          verifiedCredentials: verifiedCredentialsCount,
        },
      },
    });
  } catch (error) {
    console.error('[Profile Controller - GetProfile]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching profile data',
    });
  }
};

// @desc    Update current student profile
// @route   PUT /api/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      college,
      profilePhoto,
      bio,
      phone,
      location,
      degree,
      department,
      graduationYear,
      linkedin,
      github,
      portfolio,
      resume,
    } = req.body;

    // Update User model fields
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (name) user.name = name;
    if (college !== undefined) user.college = college;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    await user.save();

    // Update or create StudentProfile
    let profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new StudentProfile({
        userId: user._id,
        passportId: StudentProfile.generatePassportId(user.name),
      });
    }

    if (bio !== undefined) profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (degree !== undefined) profile.degree = degree;
    if (department !== undefined) profile.department = department;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (github !== undefined) profile.github = github;
    if (resume !== undefined && typeof resume === 'string' && resume.trim() !== '') {
      profile.resume = resume.trim();
      user.resume = resume.trim();
      await user.save().catch(() => {});
    }

    await profile.save();

    // Recalculate dynamic completion from MongoDB
    const verifiedCredentialsCount = await Certificate.countDocuments({
      studentId: user._id,
      status: 'VERIFIED',
    });
    const completionData = await calculateProfileCompletion(user, profile, user._id);

    const updatedPayload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
      profile,
      stats: {
        profileCompletion: completionData.percentage,
        checklist: completionData.checklist,
        totalSkills: completionData.counts.totalSkills,
        totalProjects: completionData.counts.totalProjects,
        totalCertificates: completionData.counts.totalCertificates,
        totalAchievements: completionData.counts.totalAchievements,
        verifiedCredentials: verifiedCredentialsCount,
      },
    };

    // Emit real-time Socket.IO notification
    if (req.io) {
      req.io.to(`student_${user._id}`).emit('profileUpdated', updatedPayload);
      if (profile.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('profileUpdated', updatedPayload);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedPayload,
    });
  } catch (error) {
    console.error('[Profile Controller - UpdateProfile]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Upload or update student resume file
// @route   POST /api/profile/resume
// @access  Private (Student)
const uploadResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    let resumeUrl = req.body.resumeUrl || '';
    if (req.file) {
      const originalname = req.file.originalname || 'resume.pdf';
      const attachment = await FileAttachment.create({
        filename: `resume-${user._id}-${Date.now()}${path.extname(originalname)}`,
        originalname,
        mimetype: req.file.mimetype || 'application/pdf',
        size: req.file.size || (req.file.buffer ? req.file.buffer.length : 0),
        data: req.file.buffer,
        uploadedBy: user._id,
      });
      resumeUrl = `/api/files/${attachment._id}/${encodeURIComponent(originalname)}`;
    }

    if (!resumeUrl) {
      return res.status(400).json({ status: 'error', message: 'Please attach a document or enter a resume URL' });
    }

    // Persist to both User and StudentProfile atomically
    user.resume = resumeUrl;
    await user.save().catch(() => {});

    let profile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      { 
        $set: { resume: resumeUrl },
        $setOnInsert: { passportId: StudentProfile.generatePassportId(user.name) }
      },
      { new: true, upsert: true }
    );

    const verifiedCredentialsCount = await Certificate.countDocuments({
      studentId: user._id,
      status: 'VERIFIED',
    });
    const completionData = await calculateProfileCompletion(user, profile, user._id);

    const updatedPayload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
      profile,
      stats: {
        profileCompletion: completionData.percentage,
        checklist: completionData.checklist,
        totalSkills: completionData.counts.totalSkills,
        totalProjects: completionData.counts.totalProjects,
        totalCertificates: completionData.counts.totalCertificates,
        totalAchievements: completionData.counts.totalAchievements,
        verifiedCredentials: verifiedCredentialsCount,
      },
    };

    if (req.io) {
      req.io.to(`student_${user._id}`).emit('profileUpdated', updatedPayload);
      if (profile.passportId) {
        req.io.to(`passport_${profile.passportId.toUpperCase()}`).emit('profileUpdated', updatedPayload);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Resume uploaded and synchronized successfully',
      data: {
        resume: resumeUrl,
        profile,
      },
    });
  } catch (error) {
    console.error('[Profile Controller - UploadResume]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error uploading resume',
    });
  }
};

// @desc    Delete attached resume
// @route   DELETE /api/profile/resume
// @access  Private (Student)
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.resume = '';
    await user.save().catch(() => {});

    let profile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: { resume: '' } },
      { new: true }
    );

    const verifiedCredentialsCount = await Certificate.countDocuments({
      studentId: user._id,
      status: 'VERIFIED',
    });
    const completionData = await calculateProfileCompletion(user, profile || {}, user._id);

    const updatedPayload = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
      profile: profile || {},
      stats: {
        profileCompletion: completionData.percentage,
        checklist: completionData.checklist,
        totalSkills: completionData.counts.totalSkills,
        totalProjects: completionData.counts.totalProjects,
        totalCertificates: completionData.counts.totalCertificates,
        totalAchievements: completionData.counts.totalAchievements,
        verifiedCredentials: verifiedCredentialsCount,
      },
    };

    if (req.io) {
      req.io.to(`student_${user._id}`).emit('profileUpdated', updatedPayload);
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId.toUpperCase()}`).emit('profileUpdated', updatedPayload);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Resume removed successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('[Profile Controller - DeleteResume]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting resume',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  calculateProfileCompletion,
};
