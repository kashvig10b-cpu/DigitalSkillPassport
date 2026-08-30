const {
  User,
  StudentProfile,
  Skill,
  Project,
  Certificate,
  Achievement,
  Education,
  Experience,
} = require('../models');

// @desc    Get complete public digital skill passport by unique passportId
// @route   GET /api/passport/:passportId
// @access  Public
const getPublicPassport = async (req, res) => {
  try {
    const { passportId } = req.params;

    if (!passportId) {
      return res.status(400).json({
        status: 'error',
        message: 'Passport ID is required',
      });
    }

    const profile = await StudentProfile.findOne({
      passportId: { $regex: new RegExp(`^${passportId.trim()}$`, 'i') },
    }).populate('userId', 'name email college profilePhoto role');

    if (!profile || !profile.userId) {
      return res.status(404).json({
        status: 'error',
        message: `Digital Skill Passport '${passportId}' was not found in the verified registry.`,
      });
    }

    const studentId = profile.userId._id;

    // Concurrently fetch all verified modules from real MongoDB collections
    const [
      skills,
      projects,
      certificates,
      achievements,
      education,
      experience,
    ] = await Promise.all([
      Skill.find({ studentId }).sort({ level: -1, name: 1 }),
      Project.find({ studentId }).sort({ startDate: -1, createdAt: -1 }),
      Certificate.find({ studentId }).populate('verifiedBy', 'name role').sort({ issueDate: -1 }),
      Achievement.find({ studentId }).sort({ date: -1 }),
      Education.find({ studentId }).sort({ startYear: -1 }),
      Experience.find({ studentId }).sort({ startDate: -1 }),
    ]);

    const verifiedCertsCount = certificates.filter((c) => c.status === 'VERIFIED').length;

    res.status(200).json({
      status: 'success',
      data: {
        passportId: profile.passportId,
        student: {
          id: profile.userId._id,
          name: profile.userId.name,
          email: profile.userId.email,
          college: profile.userId.college,
          profilePhoto: profile.userId.profilePhoto,
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          degree: profile.degree,
          department: profile.department,
          graduationYear: profile.graduationYear,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          resume: profile.resume,
          qrCode: profile.qrCode,
        },
        skills,
        projects,
        certificates,
        achievements,
        education,
        experience,
        stats: {
          totalSkills: skills.length,
          totalProjects: projects.length,
          verifiedCredentials: verifiedCertsCount,
          totalCertificates: certificates.length,
          totalAchievements: achievements.length,
        },
      },
    });
  } catch (error) {
    console.error('[Passport Controller - GetPublicPassport]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error resolving public skill passport',
    });
  }
};

module.exports = {
  getPublicPassport,
};
