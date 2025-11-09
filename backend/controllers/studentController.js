const Student = require('../models/Student');
const cache = require('../utils/cache');

exports.getAllStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      branch, 
      minCGPA, 
      maxBacklogs, 
      placed,
      skills,
      passingYear,
      sortBy = 'cgpa',
      sortOrder = 'desc',
      cursor // For cursor-based pagination
    } = req.query;

    const query = {};

    // Use text search instead of regex for better performance
    if (search) {
      query.$text = { $search: search };
    }

    if (branch) {
      query.branch = branch;
    }

    if (minCGPA) {
      query.cgpa = { ...query.cgpa, $gte: parseFloat(minCGPA) };
    }

    if (maxBacklogs) {
      query.backlogs = { $lte: parseInt(maxBacklogs) };
    }

    if (placed !== undefined) {
      query.placed = placed === 'true';
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    if (passingYear) {
      query.passingYear = parseInt(passingYear);
    }

    // Cursor-based pagination for better performance
    if (cursor) {
      query._id = { $gt: cursor };
    }

    const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
    const sortField = sortBy === 'cgpa' ? 'cgpa' : 'createdAt';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Use projection to reduce data transfer
    const students = await Student.find(query)
      .sort({ [sortField]: sortDirection, _id: 1 })
      .limit(limitNum)
      .select('-__v') // Exclude version key
      .lean();

    // Only count total if needed (expensive operation)
    let total = null;
    if (page == 1) {
      // Cache total count for 5 minutes
      const cacheKey = `students:count:${JSON.stringify(query)}`;
      total = await cache.getOrSet(
        cacheKey,
        () => Student.countDocuments(query),
        300
      );
    }

    // Get next cursor (last document ID)
    const nextCursor = students.length > 0 
      ? students[students.length - 1]._id 
      : null;

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      limit: limitNum,
      nextCursor,
      hasMore: students.length === limitNum,
      data: students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or roll number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedUpdates = ['phone', 'skills', 'resumeLink'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getBranches = async (req, res) => {
  try {
    // Cache branches for 1 hour (rarely changes)
    const branches = await cache.getOrSet(
      'branches:list',
      () => Student.distinct('branch'),
      3600
    );

    res.status(200).json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
