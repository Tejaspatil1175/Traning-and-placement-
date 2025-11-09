const Student = require('../models/Student');
const Company = require('../models/Company');
const cache = require('../utils/cache');

exports.getDashboardStats = async (req, res) => {
  try {
    // Try to get from cache first (5 min TTL)
    const cachedStats = cache.get('dashboard:stats');
    if (cachedStats) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedStats
      });
    }

    // Optimized: Reduce parallel queries and use aggregation
    const [studentStats, companyStats, branches, recentPlacements] = await Promise.all([
      // Single aggregation for student stats
      Student.aggregate([
        {
          $facet: {
            counts: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  placed: {
                    $sum: { $cond: ['$placed', 1, 0] }
                  }
                }
              }
            ],
            cgpaDistribution: [
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
            ]
          }
        }
      ]),
      
      // Company stats
      Company.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            upcoming: [
              { $match: { status: 'upcoming' } },
              { $count: 'count' }
            ]
          }
        }
      ]),
      
      // Branch-wise stats
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
      
      // Recent placements
      Student.find({ placed: true })
        .select('name rollNo branch placedCompany package')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()
    ]);

    const totalStudents = studentStats[0]?.counts[0]?.total || 0;
    const placedStudents = studentStats[0]?.counts[0]?.placed || 0;
    const totalCompanies = companyStats[0]?.total[0]?.count || 0;
    const upcomingCompanies = companyStats[0]?.upcoming[0]?.count || 0;
    const cgpaDistribution = studentStats[0]?.cgpaDistribution || [];

    const placementPercentage = totalStudents > 0 
      ? ((placedStudents / totalStudents) * 100).toFixed(2)
      : 0;

    const result = {
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
    };

    // Cache for 5 minutes
    cache.set('dashboard:stats', result, 300);

    res.status(200).json({
      success: true,
      cached: false,
      data: result
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
