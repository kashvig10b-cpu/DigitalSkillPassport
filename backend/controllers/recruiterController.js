const {
  User,
  StudentProfile,
  Skill,
  Project,
  Certificate,
  Education,
} = require('../models');

// @desc    Search and filter candidates across universities & skillsets
// @route   GET /api/recruiter/search
// @access  Private (Recruiter, Admin)
const searchCandidates = async (req, res) => {
  try {
    // Recruiter Verification Gate: Block unapproved recruiters from accessing student data
    if (req.user && req.user.role === 'recruiter') {
      const recruiterUser = await User.findById(req.user.id);
      if (recruiterUser && recruiterUser.recruiterStatus !== 'APPROVED') {
        return res.status(403).json({
          status: 'error',
          code: 'RECRUITER_PENDING_APPROVAL',
          message: 'Your recruiter account is pending administrative verification. Candidate records are locked until approved.',
        });
      }
    }

    const {
      search,
      skill,
      degree,
      department,
      college,
      location,
      minCompletion,
      verifiedOnly,
    } = req.query;

    // Base query for StudentProfile
    let profileQuery = {};

    if (degree) {
      profileQuery.degree = { $regex: new RegExp(degree.trim(), 'i') };
    }
    if (department) {
      profileQuery.department = { $regex: new RegExp(department.trim(), 'i') };
    }
    if (location) {
      profileQuery.location = { $regex: new RegExp(location.trim(), 'i') };
    }

    // User lookup query
    let userQuery = { role: 'student' };
    if (college) {
      userQuery.college = { $regex: new RegExp(college.trim(), 'i') };
    }
    if (search) {
      userQuery.$or = [
        { name: { $regex: new RegExp(search.trim(), 'i') } },
        { email: { $regex: new RegExp(search.trim(), 'i') } },
        { college: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    // Find matching users first
    const matchedUsers = await User.find(userQuery).select('name email college profilePhoto');
    const matchedUserIds = matchedUsers.map((u) => u._id);

    profileQuery.userId = { $in: matchedUserIds };

    // Fetch profiles
    const profiles = await StudentProfile.find(profileQuery).populate(
      'userId',
      'name email college profilePhoto'
    );

    // Build candidate cards with associated skills, projects, certificates, and real completion metrics
    const candidates = await Promise.all(
      profiles.map(async (profile) => {
        if (!profile.userId) return null;
        const studentId = profile.userId._id;

        const [skills, projects, certificates, educations] = await Promise.all([
          Skill.find({ studentId }).sort({ level: -1 }).select('name level category'),
          Project.find({ studentId }).select('title techStack liveUrl githubUrl'),
          Certificate.find({ studentId }).select('title issuer status'),
          Education.find({ studentId }).select('_id'),
        ]);

        const verifiedCerts = certificates.filter((c) => c.status === 'VERIFIED');

        // Check verifiedOnly filter
        if (verifiedOnly === 'true' && verifiedCerts.length === 0) {
          return null;
        }

        // Check skill filter
        if (skill) {
          const hasSkill = skills.some((s) =>
            s.name.toLowerCase().includes(skill.trim().toLowerCase())
          );
          if (!hasSkill) return null;
        }

        // Calculate dynamic profile completion score (0 - 100%)
        let completionScore = 0;
        if (profile.userId.profilePhoto) completionScore += 10;
        if (profile.bio && profile.bio.trim().length > 5) completionScore += 10;
        if (profile.phone || profile.location) completionScore += 10;
        if (profile.degree || profile.department) completionScore += 15;
        if (educations.length > 0) completionScore += 15;
        if (skills.length > 0) completionScore += 15;
        if (projects.length > 0) completionScore += 15;
        if (certificates.length > 0 || profile.resume) completionScore += 10;

        const finalCompletion = Math.min(100, Math.round(completionScore));

        // Save computed completion score to MongoDB in background
        if (profile.profileCompletion !== finalCompletion) {
          StudentProfile.updateOne({ _id: profile._id }, { profileCompletion: finalCompletion }).catch(() => {});
        }

        // Filter by minCompletion slider
        if (minCompletion && finalCompletion < Number(minCompletion)) {
          return null;
        }

        return {
          id: studentId,
          passportId: profile.passportId,
          name: profile.userId.name,
          email: profile.userId.email,
          college: profile.userId.college,
          profilePhoto: profile.userId.profilePhoto,
          degree: profile.degree || 'Computer Science & Engineering',
          department: profile.department || '',
          location: profile.location || '',
          bio: profile.bio || '',
          resume: profile.resume || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          portfolio: profile.portfolio || '',
          profileCompletion: finalCompletion,
          topSkills: skills.slice(0, 5),
          totalSkillsCount: skills.length,
          totalProjectsCount: projects.length,
          verifiedCredentialsCount: verifiedCerts.length,
          totalCertificatesCount: certificates.length,
        };
      })
    );

    // Filter out null candidates
    const filteredCandidates = candidates.filter(Boolean);

    res.status(200).json({
      status: 'success',
      count: filteredCandidates.length,
      data: filteredCandidates,
    });
  } catch (error) {
    console.error('[Recruiter Controller - Search]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error executing candidate search',
    });
  }
};

// @desc    Get dynamic filter options (distinct colleges, degrees, top skills)
// @route   GET /api/recruiter/filters
// @access  Private (Recruiter, Admin)
const getFilterOptions = async (req, res) => {
  try {
    const [colleges, degrees, departments, rawSkills] = await Promise.all([
      User.distinct('college', { role: 'student', college: { $ne: '' } }),
      StudentProfile.distinct('degree', { degree: { $ne: '' } }),
      StudentProfile.distinct('department', { department: { $ne: '' } }),
      Skill.distinct('name'),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        colleges: colleges.filter(Boolean),
        degrees: degrees.filter(Boolean),
        departments: departments.filter(Boolean),
        skills: rawSkills.filter(Boolean).slice(0, 30),
      },
    });
  } catch (error) {
    console.error('[Recruiter Controller - GetFilterOptions]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  searchCandidates,
  getFilterOptions,
};
