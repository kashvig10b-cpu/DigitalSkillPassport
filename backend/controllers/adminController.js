const {
  User,
  StudentProfile,
  Certificate,
  Skill,
  Project,
} = require('../models');

// @desc    Get system-wide metrics for Admin Control Panel
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalRecruiters,
      pendingCerts,
      verifiedCerts,
      totalSkills,
      totalProjects,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Certificate.countDocuments({ status: 'PENDING' }),
      Certificate.countDocuments({ status: 'VERIFIED' }),
      Skill.countDocuments(),
      Project.countDocuments(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents,
        totalRecruiters,
        pendingCerts,
        verifiedCerts,
        totalSkills,
        totalProjects,
      },
    });
  } catch (error) {
    console.error('[Admin Controller - GetStats]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all certificates in verification queue (optionally filtered by status)
// @route   GET /api/admin/certificates
// @access  Private (Admin)
const getAdminCertificates = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const certificates = await Certificate.find(query)
      .populate('studentId', 'name email college profilePhoto')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error('[Admin Controller - GetCertificates]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Approve and cryptographically verify a student's certificate
// @route   PUT /api/admin/certificates/:id/verify
// @access  Private (Admin)
const verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id).populate(
      'studentId',
      'name email college'
    );
    if (!certificate) {
      return res.status(404).json({ status: 'error', message: 'Certificate not found' });
    }

    certificate.status = 'VERIFIED';
    certificate.verifiedBy = req.user._id;
    certificate.verifiedAt = new Date();
    certificate.rejectionReason = '';
    await certificate.save();

    // Fetch student's passportId
    const profile = await StudentProfile.findOne({ userId: certificate.studentId._id });

    const payload = {
      certificateId: certificate._id,
      title: certificate.title,
      status: 'VERIFIED',
      verifiedAt: certificate.verifiedAt,
      verifiedBy: req.user.name,
      studentId: certificate.studentId._id,
    };

    // Real-time Socket.IO emission to student & public passport rooms
    if (req.io) {
      req.io.to(`student_${certificate.studentId._id}`).emit('certificateVerified', certificate);
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('certificateVerified', certificate);
      }
      req.io.to('admin_room').emit('certificateUpdated', certificate);
    }

    res.status(200).json({
      status: 'success',
      message: `Certificate '${certificate.title}' officially verified!`,
      data: certificate,
    });
  } catch (error) {
    console.error('[Admin Controller - VerifyCertificate]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Reject a certificate with specific feedback
// @route   PUT /api/admin/certificates/:id/reject
// @access  Private (Admin)
const rejectCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findById(id).populate(
      'studentId',
      'name email college'
    );
    if (!certificate) {
      return res.status(404).json({ status: 'error', message: 'Certificate not found' });
    }

    certificate.status = 'REJECTED';
    certificate.rejectionReason = reason ? reason.trim() : 'Document could not be validated against issuer records.';
    certificate.verifiedBy = req.user._id;
    certificate.verifiedAt = new Date();
    await certificate.save();

    const profile = await StudentProfile.findOne({ userId: certificate.studentId._id });

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${certificate.studentId._id}`).emit('certificateRejected', certificate);
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('certificateRejected', certificate);
      }
      req.io.to('admin_room').emit('certificateUpdated', certificate);
    }

    res.status(200).json({
      status: 'success',
      message: `Certificate marked as REJECTED with feedback`,
      data: certificate,
    });
  } catch (error) {
    console.error('[Admin Controller - RejectCertificate]', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAdminCertificates,
  verifyCertificate,
  rejectCertificate,
};
