const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivities
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/stats', protect, authorize('admin', 'tpo'), getDashboardStats);
router.get('/recent', protect, authorize('admin', 'tpo'), getRecentActivities);

module.exports = router;
