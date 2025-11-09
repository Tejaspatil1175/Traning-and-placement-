const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
    index: true
  },
  cgpa: {
    type: Number,
    required: [true, 'CGPA is required'],
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10'],
    index: true
  },
  backlogs: {
    type: Number,
    required: [true, 'Backlogs count is required'],
    min: [0, 'Backlogs cannot be negative'],
    default: 0,
    index: true
  },
  passingYear: {
    type: Number,
    required: [true, 'Passing year is required'],
    index: true
  },
  skills: {
    type: [String],
    default: []
    // index removed - using compound index below
  },
  resumeLink: {
    type: String,
    trim: true,
    default: ''
  },
  placed: {
    type: Boolean,
    default: false,
    index: true
  },
  placedCompany: {
    type: String,
    default: null
  },
  package: {
    type: Number,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
studentSchema.index({ cgpa: -1, backlogs: 1 });
studentSchema.index({ branch: 1, cgpa: -1 });
studentSchema.index({ placed: 1, passingYear: 1 });
studentSchema.index({ skills: 1 });

// Text index for fast search (replaces regex)
studentSchema.index({ 
  name: 'text', 
  email: 'text', 
  rollNo: 'text' 
}, {
  weights: {
    rollNo: 10,  // Highest priority
    email: 5,
    name: 3
  }
});

// Partial index for active students (reduces index size)
studentSchema.index(
  { placed: 1, cgpa: -1 },
  { partialFilterExpression: { placed: false } }
);

// Add lean() helper for better performance
studentSchema.statics.findLean = function(query = {}) {
  return this.find(query).lean();
};

module.exports = mongoose.model('Student', studentSchema);
