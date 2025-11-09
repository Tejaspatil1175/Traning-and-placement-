const Company = require('../models/Company');
const Student = require('../models/Student');

exports.getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const companies = await Company.find(query)
      .sort({ recruitmentDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: companies
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.filterEligibleStudents = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const { minCGPA, maxBacklogs, branchesAllowed, skillsRequired } = company.criteria;

    const query = {
      cgpa: { $gte: minCGPA },
      backlogs: { $lte: maxBacklogs },
      branch: { $in: branchesAllowed },
      placed: false
    };

    if (skillsRequired && skillsRequired.length > 0) {
      query.skills = { $in: skillsRequired };
    }

    const eligibleStudents = await Student.find(query)
      .select('name email rollNo branch cgpa backlogs skills resumeLink')
      .sort({ cgpa: -1 })
      .lean();

    await Company.findByIdAndUpdate(req.params.id, {
      eligibleStudentsCount: eligibleStudents.length
    });

    res.status(200).json({
      success: true,
      count: eligibleStudents.length,
      criteria: company.criteria,
      data: eligibleStudents
    });
  } catch (error) {
    console.error('Filter eligible students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getEligibleCompaniesForStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (student.placed) {
      return res.status(200).json({
        success: true,
        message: 'You are already placed',
        data: []
      });
    }

    const companies = await Company.find({
      'criteria.minCGPA': { $lte: student.cgpa },
      'criteria.maxBacklogs': { $gte: student.backlogs },
      'criteria.branchesAllowed': student.branch,
      status: { $in: ['upcoming', 'ongoing'] }
    })
    .sort({ recruitmentDate: 1 })
    .lean();

    const eligibleCompanies = companies.filter(company => {
      if (company.criteria.skillsRequired && company.criteria.skillsRequired.length > 0) {
        return company.criteria.skillsRequired.some(skill => 
          student.skills.includes(skill)
        );
      }
      return true;
    });

    res.status(200).json({
      success: true,
      count: eligibleCompanies.length,
      data: eligibleCompanies
    });
  } catch (error) {
    console.error('Get eligible companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
