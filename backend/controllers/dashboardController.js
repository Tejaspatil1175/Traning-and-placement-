const Student = require('../models/Student');
const Company = require('../models/Company');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      placedStudents,
      totalCompanies,
      upcomingCompanies,
      branches,
      recentPlacements
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ placed: true }),
      Company.countDocuments(),
      Company.countDocuments({ status: 'upcoming' }),
      Student.aggregate([
        {
          $group: {
            _id: '$branch',
            count: { $sum: 1 },
            placed: {
              $sum: { $cond: ['$placed', 1, 0] }
            },
            avgCGPA: { $avg: '$cgpa' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Student.find({ placed: true })
        .select('name rollNo branch placedCompany package')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()
    ]);

    const placementPercentage = totalStudents > 0 
      ? ((placedStudents / totalStudents) * 100).toFixed(2)
      : 0;

    const cgpaDistribution = await Student.aggregate([
      {
        $bucket: {
          groupBy: '$cgpa',
          boundaries: [0, 5, 6, 7, 8, 9, 10],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          placedStudents,
          unplacedStudents: totalStudents - placedStudents,
          placementPercentage: parseFloat(placementPercentage),
          totalCompanies,
          upcomingCompanies
        },
        branchWise: branches,
        cgpaDistribution,
        recentPlacements
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const [recentStudents, recentCompanies] = await Promise.all([
      Student.find()
        .select('name rollNo branch cgpa')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Company.find()
        .select('companyName role package recruitmentDate')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentStudents,
        recentCompanies
      }
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
