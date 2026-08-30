const mongoose = require('mongoose');
const crypto = require('crypto');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    degree: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    graduationYear: {
      type: Number,
      min: [1980, 'Graduation year is too early'],
      max: [2100, 'Graduation year is invalid'],
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    portfolio: {
      type: String,
      trim: true,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    passportId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Utility function to generate unique passport ID
studentProfileSchema.statics.generatePassportId = function (name = 'STUDENT') {
  const prefix = name
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'PASSPORT';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${suffix}`;
};

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
