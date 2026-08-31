const { Certificate, StudentProfile, FileAttachment } = require('../models');
const path = require('path');
const fs = require('fs');

// @desc    Get all certificates for authenticated student
// @route   GET /api/certificates
// @access  Private (Student)
const getCertificates = async (req, res) => {
  try {
    const studentId = req.user._id;
    const certificates = await Certificate.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error('[Certificate Controller - GetCertificates]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch certificates',
    });
  }
};

// @desc    Upload and create a new certificate
// @route   POST /api/certificates
// @access  Private (Student)
const createCertificate = async (req, res) => {
  try {
    const title = (req.body.title || req.body.name || '').trim();
    const issuer = (req.body.issuer || req.body.issuingOrganization || '').trim();
    const {
      issueDate,
      expirationDate,
      expiryDate,
      credentialId,
      credentialUrl,
      certificateUrl,
    } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate title and issuing organization are required',
      });
    }

    let fileUrl = '';
    if (req.file) {
      const originalname = req.file.originalname || 'certificate.pdf';
      const attachment = await FileAttachment.create({
        filename: `cert-${req.user._id}-${Date.now()}${path.extname(originalname)}`,
        originalname,
        mimetype: req.file.mimetype || 'application/pdf',
        size: req.file.size || (req.file.buffer ? req.file.buffer.length : 0),
        data: req.file.buffer,
        uploadedBy: req.user._id,
      });
      fileUrl = `/api/files/${attachment._id}/${encodeURIComponent(originalname)}`;
    }

    const certificate = await Certificate.create({
      studentId: req.user._id,
      name: title,
      title: title,
      issuer: issuer,
      issueDate: issueDate || new Date(),
      expirationDate: expirationDate || expiryDate || null,
      expiryDate: expirationDate || expiryDate || null,
      credentialId: credentialId ? credentialId.trim() : `DSP-${Date.now().toString(36).toUpperCase()}`,
      credentialUrl: credentialUrl || certificateUrl || '',
      certificateUrl: credentialUrl || certificateUrl || '',
      fileUrl,
      document: fileUrl,
      status: 'PENDING',
    });

    // Real-time Socket.IO emission to student & admin room
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('certificateUploaded', certificate);
      req.io.to('admin_room').emit('certificateUploaded', certificate);

      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('certificateUploaded', certificate);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Certificate submitted successfully and entered the verification queue (PENDING)',
      data: certificate,
    });
  } catch (error) {
    console.error('[Certificate Controller - CreateCertificate]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload certificate',
    });
  }
};

// @desc    Update an existing certificate
// @route   PUT /api/certificates/:id
// @access  Private (Student)
const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      issuer,
      issueDate,
      expirationDate,
      credentialId,
      credentialUrl,
    } = req.body;

    const certificate = await Certificate.findOne({ _id: id, studentId: req.user._id });
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or unauthorized',
      });
    }

    if (title || req.body.name) {
      const val = (title || req.body.name).trim();
      certificate.title = val;
      certificate.name = val;
    }
    if (issuer) certificate.issuer = issuer.trim();
    if (issueDate !== undefined) certificate.issueDate = issueDate;
    if (expirationDate !== undefined || req.body.expiryDate !== undefined) {
      const exp = expirationDate || req.body.expiryDate;
      certificate.expirationDate = exp;
      certificate.expiryDate = exp;
    }
    if (credentialId !== undefined) certificate.credentialId = credentialId.trim();
    if (credentialUrl !== undefined || req.body.certificateUrl !== undefined) {
      const urlVal = (credentialUrl || req.body.certificateUrl).trim();
      certificate.credentialUrl = urlVal;
      certificate.certificateUrl = urlVal;
    }

    if (req.file) {
      // Remove old file if it existed
      if (certificate.fileUrl && certificate.fileUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', certificate.fileUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }
      certificate.fileUrl = `/uploads/${req.file.filename}`;
      // Reset status to PENDING if a new file was uploaded
      certificate.status = 'PENDING';
      certificate.rejectionReason = '';
    }

    await certificate.save();

    // Socket emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('certificateUpdated', certificate);
      req.io.to('admin_room').emit('certificateUpdated', certificate);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('certificateUpdated', certificate);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Certificate updated successfully',
      data: certificate,
    });
  } catch (error) {
    console.error('[Certificate Controller - UpdateCertificate]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update certificate',
    });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Student)
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or unauthorized',
      });
    }

    // Clean up physical file
    if (certificate.fileUrl && certificate.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', certificate.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    // Real-time Socket.IO emission
    if (req.io) {
      req.io.to(`student_${req.user._id}`).emit('certificateDeleted', id);
      req.io.to('admin_room').emit('certificateDeleted', id);
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile?.passportId) {
        req.io.to(`passport_${profile.passportId}`).emit('certificateDeleted', id);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Certificate deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Certificate Controller - DeleteCertificate]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete certificate',
    });
  }
};

module.exports = {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};
