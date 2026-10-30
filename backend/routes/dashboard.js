const express = require('express');
const router = express.Router();
const { getDashboardSummary, getCategoryBreakdown, getMonthlyTrends } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/monthly-trends', getMonthlyTrends);

module.exports = router;

