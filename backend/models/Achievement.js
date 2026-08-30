const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
    },
    proof: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
