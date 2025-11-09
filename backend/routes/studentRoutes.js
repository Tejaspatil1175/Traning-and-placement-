const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
  getBranches
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/profile', protect, authorize('student'), getMyProfile);
router.put('/profile', protect, authorize('student'), updateMyProfile);

router.get('/branches', protect, getBranches);

router.route('/')
  .get(protect, authorize('admin', 'tpo'), getAllStudents)
  .post(protect, authorize('admin', 'tpo'), createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin', 'tpo'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
