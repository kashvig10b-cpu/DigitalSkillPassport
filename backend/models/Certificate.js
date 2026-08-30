const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    issuer: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
      maxlength: [150, 'Issuer cannot exceed 150 characters'],
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Credential ID cannot exceed 100 characters'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    document: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    certificateUrl: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'VERIFIED', 'REJECTED'],
        message: '{VALUE} is not a valid certificate status',
      },
      default: 'PENDING',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to sync name & title, document & fileUrl, and ensure valid defaults
certificateSchema.pre('validate', function (next) {
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && !this.title) {
    this.name = 'Untitled Certificate';
    this.title = 'Untitled Certificate';
  }
  if (!this.fileUrl && this.document) {
    this.fileUrl = this.document;
  }
  if (!this.document && this.fileUrl) {
    this.document = this.fileUrl;
  }
  if (!this.expiryDate && this.expirationDate) {
    this.expiryDate = this.expirationDate;
  }
  if (!this.expirationDate && this.expiryDate) {
    this.expirationDate = this.expiryDate;
  }
  if (!this.certificateUrl && this.credentialUrl) {
    this.certificateUrl = this.credentialUrl;
  }
  if (!this.credentialUrl && this.certificateUrl) {
    this.credentialUrl = this.certificateUrl;
  }
  if (!this.credentialId) {
    this.credentialId = `DSP-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
