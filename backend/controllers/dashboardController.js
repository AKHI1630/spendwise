const Transaction = require('../models/Transaction');

// @desc    Get dashboard summary for a specific month
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // All-time balance
    const allTimeStats = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const allTimeMap = {};
    allTimeStats.forEach((s) => (allTimeMap[s._id] = s.total));
    const totalBalance = (allTimeMap.income || 0) - (allTimeMap.expense || 0);

    // Monthly stats
    const monthlyStats = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyMap = {};
    monthlyStats.forEach((s) => (monthlyMap[s._id] = { total: s.total, count: s.count }));

    const monthlyIncome = monthlyMap.income?.total || 0;
    const monthlyExpenses = monthlyMap.expense?.total || 0;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate: parseFloat(savingsRate),
        recentTransactions,
        period: { month: targetMonth + 1, year: targetYear },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense breakdown by category
// @route   GET /api/dashboard/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpenses = breakdown.reduce((sum, b) => sum + b.total, 0);
    const result = breakdown.map((b) => ({
      category: b._id,
      total: b.total,
      count: b.count,
      percentage: totalExpenses > 0 ? parseFloat(((b.total / totalExpenses) * 100).toFixed(1)) : 0,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly trends (last 6 months)
// @route   GET /api/dashboard/monthly-trends
// @access  Private
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build month labels
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const result = months.map(({ year, month }) => {
      const incomeEntry = trends.find((t) => t._id.year === year && t._id.month === month && t._id.type === 'income');
      const expenseEntry = trends.find((t) => t._id.year === year && t._id.month === month && t._id.type === 'expense');
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
      return {
        month: monthName,
        year,
        income: incomeEntry?.total || 0,
        expenses: expenseEntry?.total || 0,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary, getCategoryBreakdown, getMonthlyTrends };

