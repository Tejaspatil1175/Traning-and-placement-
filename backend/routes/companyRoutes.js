const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  filterEligibleStudents,
  getEligibleCompaniesForStudent
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/eligible', protect, authorize('student'), getEligibleCompaniesForStudent);

router.route('/')
  .get(protect, getAllCompanies)
  .post(protect, authorize('admin', 'tpo'), createCompany);

router.route('/:id')
  .get(protect, getCompanyById)
  .put(protect, authorize('admin', 'tpo'), updateCompany)
  .delete(protect, authorize('admin'), deleteCompany);

router.post('/:id/filter', protect, authorize('admin', 'tpo'), filterEligibleStudents);

module.exports = router;
