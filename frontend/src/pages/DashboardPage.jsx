import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown,
  PiggyBank, Plus, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { dashboardService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, formatDate, getCategoryColor, getMonthName,
} from '../utils/helpers';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import PageHeader from '../components/PageHeader';
import './DashboardPage.css';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.name}>
          {p.name}: {formatCurrency(p.value, 'INR')}
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{payload[0].name}</div>
      <div>{formatCurrency(payload[0].value, 'INR')}</div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [summaryData, setSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'income' | 'expense' | null

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, breakdownRes, recentRes] = await Promise.all([
        dashboardService.getSummary({ month, year }),
        dashboardService.getMonthlyTrends(),
        dashboardService.getCategoryBreakdown({ month, year }),
        import('../services/transactionService').then(m =>
          m.transactionService.getAll({ limit: 5, sort: '-date' })
        ),
      ]);
      setSummaryData(summaryRes.data);
      setTrendsData(trendsRes.data?.trends || trendsRes.data || []);
      setBreakdownData(breakdownRes.data?.breakdown || breakdownRes.data || []);
      setRecentTransactions(
        recentRes.data?.transactions || recentRes.data?.data || []
      );
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const monthLabel = `${getMonthName(month)} ${year}`;

  const summary = summaryData;
  const totalBalance = summary?.totalBalance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0.0';

  // Chart colors
  const INCOME_COLOR = '#16A36A';
  const EXPENSE_COLOR = '#EF4444';

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`${getGreeting()}, ${firstName}!`}
        subtitle={monthLabel}
      >
        <button className="btn btn-primary" onClick={() => { setModalType(null); setShowModal(true); }}>
          <Plus size={16} />
          Add Transaction
        </button>
      </PageHeader>

      <div className="dashboard-body">
        {/* Month Selector */}
        <div className="month-selector">
          <button className="month-nav-btn" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="month-selector-label">{monthLabel}</span>
          <button className="month-nav-btn" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Balance"
            value={formatCurrency(totalBalance, 'INR')}
            subtitle="All-time balance"
            icon={<Wallet size={20} />}
            color="primary"
          />
          <StatCard
            title="Monthly Income"
            value={formatCurrency(totalIncome, 'INR')}
            subtitle={monthLabel}
            icon={<TrendingUp size={20} />}
            color="income"
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(totalExpenses, 'INR')}
            subtitle={monthLabel}
            icon={<TrendingDown size={20} />}
            color="expense"
          />
          <StatCard
            title="Savings"
            value={formatCurrency(savings, 'INR')}
            subtitle={`${savingsRate}% savings rate`}
            icon={<PiggyBank size={20} />}
            color="savings"
          />
        </div>

        {/* Charts */}
        <div className="charts-row">
          {/* Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">Income vs Expenses</h3>
            {loading ? (
              <div className="page-loading" style={{ minHeight: 220 }}>
                <div className="spinner" />
              </div>
            ) : trendsData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p>No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendsData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<BarTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">Spending by Category</h3>
            {loading ? (
              <div className="page-loading" style={{ minHeight: 220 }}>
                <div className="spinner" />
              </div>
            ) : breakdownData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p>No spending data for {monthLabel}</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {breakdownData.map((entry) => (
                        <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-legend">
                  {breakdownData.slice(0, 5).map((entry) => {
                    const total = breakdownData.reduce((s, e) => s + e.amount, 0);
                    const pct = total > 0 ? ((entry.amount / total) * 100).toFixed(0) : 0;
                    return (
                      <div className="donut-legend-item" key={entry.category}>
                        <div className="donut-legend-left">
                          <div className="donut-legend-dot" style={{ background: getCategoryColor(entry.category) }} />
                          <span className="donut-legend-name">{entry.category}</span>
                        </div>
                        <span className="donut-legend-val">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions-card">
          <div className="recent-tx-header">
            <h3>Recent Transactions</h3>
            <Link to="/transactions" className="recent-tx-view-all">View All</Link>
          </div>
          {loading ? (
            <div className="page-loading" style={{ minHeight: 100 }}>
              <div className="spinner" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <p>No transactions yet. Add your first one!</p>
            </div>
          ) : (
            <div className="recent-tx-list">
              {recentTransactions.map((tx) => (
                <div className="recent-tx-row" key={tx._id}>
                  <div
                    className="recent-tx-icon"
                    style={{
                      background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                      color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
                    }}
                  >
                    {tx.type === 'income' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  </div>
                  <div className="recent-tx-info">
                    <div className="recent-tx-title">{tx.title}</div>
                    <div className="recent-tx-meta">{tx.category} · {formatDate(tx.date)}</div>
                  </div>
                  <div className="recent-tx-amount" style={{ color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 'INR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="btn btn-secondary"
            onClick={() => { setModalType('income'); setShowModal(true); }}
          >
            <ArrowUpCircle size={16} style={{ color: 'var(--income-color)' }} />
            Add Income
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setModalType('expense'); setShowModal(true); }}
          >
            <ArrowDownCircle size={16} style={{ color: 'var(--expense-color)' }} />
            Add Expense
          </button>
          <Link to="/transactions" className="btn btn-secondary">
            View All Transactions
          </Link>
        </div>
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transaction={modalType ? { type: modalType } : null}
        onSuccess={fetchAll}
      />
    </div>
  );
};

export default DashboardPage;
