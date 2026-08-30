const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Programming',
          'Web Development',
          'Database',
          'AI/ML',
          'Problem Solving',
          'Communication',
          'Leadership',
          'Cloud & DevOps',
          'Mobile Development',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Programming',
    },
    level: {
      type: String,
      required: [true, 'Skill level is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid skill level',
      },
      default: 'Intermediate',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience is invalid'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate skill per student
skillSchema.index({ studentId: 1, name: 1 }, { unique: true });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
