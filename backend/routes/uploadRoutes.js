const express = require('express');
const router = express.Router();
const {
  uploadMiddleware,
  uploadStudents,
  downloadTemplate,
  exportStudents
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post(
  '/students',
  protect,
  authorize('admin', 'tpo'),
  uploadMiddleware,
  uploadStudents
);

router.get('/template', downloadTemplate);

router.post('/export', protect, authorize('admin', 'tpo'), exportStudents);

module.exports = router;
