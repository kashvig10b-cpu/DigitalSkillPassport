const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [150, 'Institution name cannot exceed 150 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
      min: [1950, 'Start year is invalid'],
      max: [2100, 'Start year is invalid'],
    },
    endYear: {
      type: Number,
      min: [1950, 'End year is invalid'],
      max: [2100, 'End year is invalid'],
    },
    cgpa: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Education = mongoose.model('Education', educationSchema);

module.exports = Education;
