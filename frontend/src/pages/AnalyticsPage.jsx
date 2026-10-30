import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { dashboardService } from '../services/transactionService';
import {
  formatCurrency, getCategoryColor, getMonthName,
} from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import './AnalyticsPage.css';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.name}>{p.name}: {formatCurrency(p.value, 'INR')}</div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [breakdownData, setBreakdownData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, breakdownRes] = await Promise.all([
        dashboardService.getSummary({ month, year }),
        dashboardService.getMonthlyTrends(),
        dashboardService.getCategoryBreakdown({ month, year }),
      ]);
      setSummaryData(summaryRes.data);
      setTrendsData(trendsRes.data?.trends || trendsRes.data || []);
      setBreakdownData(breakdownRes.data?.breakdown || breakdownRes.data || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalExpenses = summaryData?.totalExpenses ?? 0;
  const totalIncome = summaryData?.totalIncome ?? 0;
  const expenseCount = summaryData?.expenseCount ?? breakdownData.reduce((s, e) => s + (e.count || 0), 0);
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0.0';
  const topCategory = breakdownData[0]?.category || '—';
  const totalTx = summaryData?.transactionCount ?? (summaryData?.incomeCount ?? 0) + (summaryData?.expenseCount ?? 0);

  const breakdownTotal = breakdownData.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="analytics-page">
      <PageHeader title="Analytics" subtitle="Detailed financial insights">
        <div className="analytics-header-controls">
          <select
            className="analytics-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            className="analytics-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="analytics-body">
        {/* Key Metrics */}
        <div className="analytics-metrics-row">
          <div className="mini-metric-card">
            <div className="mini-metric-label">Total Transactions</div>
            <div className="mini-metric-value">{totalTx || 0}</div>
            <div className="mini-metric-sub">This month</div>
          </div>
          <div className="mini-metric-card">
            <div className="mini-metric-label">Top Expense Category</div>
            <div className="mini-metric-value" style={{ fontSize: 18 }}>{topCategory}</div>
            <div className="mini-metric-sub">
              {breakdownData[0] ? formatCurrency(breakdownData[0].amount, 'INR') : 'No data'}
            </div>
          </div>
          <div className="mini-metric-card">
            <div className="mini-metric-label">Average Expense</div>
            <div className="mini-metric-value" style={{ fontSize: 18 }}>{formatCurrency(avgExpense, 'INR')}</div>
            <div className="mini-metric-sub">Per transaction</div>
          </div>
          <div className="mini-metric-card">
            <div className="mini-metric-label">Savings Rate</div>
            <div className="mini-metric-value" style={{ color: parseFloat(savingsRate) >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
              {savingsRate}%
            </div>
            <div className="mini-metric-sub">Income vs Expenses</div>
          </div>
        </div>

        {/* Income vs Expenses Bar Chart — full width */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Monthly Income vs Expenses (Last 6 Months)</h3>
          {loading ? (
            <div className="page-loading" style={{ minHeight: 240 }}><div className="spinner" /></div>
          ) : trendsData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}><p>No trend data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendsData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="income" name="Income" fill="#16A36A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Two column: Donut + Breakdown Table */}
        <div className="analytics-two-col">
          {/* Donut Chart */}
          <div className="analytics-chart-card">
            <h3 className="analytics-chart-title">Category Breakdown — {getMonthName(month)} {year}</h3>
            {loading ? (
              <div className="page-loading" style={{ minHeight: 200 }}><div className="spinner" /></div>
            ) : breakdownData.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}><p>No spending data this month</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                  >
                    {breakdownData.map((entry) => (
                      <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value, 'INR')}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="analytics-chart-card">
            <h3 className="analytics-chart-title">Category Details</h3>
            {loading ? (
              <div className="page-loading" style={{ minHeight: 200 }}><div className="spinner" /></div>
            ) : breakdownData.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}><p>No spending data this month</p></div>
            ) : (
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Count</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownData.map((entry) => {
                    const pct = breakdownTotal > 0 ? ((entry.amount / breakdownTotal) * 100).toFixed(1) : 0;
                    return (
                      <tr key={entry.category}>
                        <td>
                          <div className="breakdown-cat-label">
                            <div className="breakdown-dot" style={{ background: getCategoryColor(entry.category) }} />
                            {entry.category}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{formatCurrency(entry.amount, 'INR')}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{entry.count || 0}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Spending Trends Line Chart */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Spending Trends (Month-by-Month)</h3>
          {loading ? (
            <div className="page-loading" style={{ minHeight: 220 }}><div className="spinner" /></div>
          ) : trendsData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}><p>No trend data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendsData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#16A36A" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
