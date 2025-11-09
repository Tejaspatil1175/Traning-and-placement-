const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  package: {
    type: Number,
    required: [true, 'Package is required'],
    min: [0, 'Package cannot be negative']
  },
  criteria: {
    minCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10']
    },
    maxBacklogs: {
      type: Number,
      required: [true, 'Maximum backlogs is required'],
      min: [0, 'Backlogs cannot be negative'],
      default: 0
    },
    branchesAllowed: {
      type: [String],
      required: [true, 'At least one branch must be specified'],
      validate: {
        validator: function(arr) {
          return arr.length > 0;
        },
        message: 'At least one branch must be allowed'
      }
    },
    skillsRequired: {
      type: [String],
      default: []
    }
  },
  recruitmentDate: {
    type: Date,
    required: [true, 'Recruitment date is required']
  },
  eligibleStudentsCount: {
    type: Number,
    default: 0
  },
  appliedStudentsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

companySchema.index({ recruitmentDate: -1 });
companySchema.index({ status: 1 });
companySchema.index({ 'criteria.minCGPA': 1 });

module.exports = mongoose.model('Company', companySchema);
