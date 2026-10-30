import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import {
  formatCurrency, formatDate, getCategoryColor,
  getCategoriesForType, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  getErrorMessage,
} from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import './TransactionsPage.css';

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const LIMIT = 15;

const TransactionsPage = () => {
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    sort: '-date',
  });
  const [searchInput, setSearchInput] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const debounceRef = useRef(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...filters,
      };
      // Remove empty params
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k];
      });
      const res = await transactionService.getAll(params);
      const data = res.data;
      setTransactions(data.transactions || data.data || []);
      setTotal(data.total || data.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', type: '', category: '', startDate: '', endDate: '', sort: '-date' });
    setPage(1);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setShowModal(true);
  };

  const handleDeleteClick = (tx) => {
    setDeleteTarget(tx);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await transactionService.remove(deleteTarget._id);
      toast.success('Transaction deleted');
      setShowConfirm(false);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = () => {
    fetchTransactions();
    setEditingTransaction(null);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const startItem = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="transactions-page">
      <PageHeader title="Transactions" subtitle={`${total} transaction${total !== 1 ? 's' : ''} total`}>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingTransaction(null); setShowModal(true); }}
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </PageHeader>

      <div className="transactions-body">
        {/* Filters */}
        <div className="filters-card">
          <div className="filters-row">
            <div className="filter-search-wrap">
              <Search size={15} className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input"
                placeholder="Search transactions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              className="filter-date-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              title="Start date"
            />
            <input
              type="date"
              className="filter-date-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              title="End date"
            />

            <select
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="-date">Newest First</option>
              <option value="date">Oldest First</option>
              <option value="-amount">Highest Amount</option>
              <option value="amount">Lowest Amount</option>
            </select>

            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {/* Table — Desktop */}
        <div className="transactions-table-card">
          {loading ? (
            <div className="page-loading">
              <div className="spinner" />
              <span>Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={28} />
              </div>
              <h3>No transactions found</h3>
              <p>Try adjusting your filters or add a new transaction.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className={`tx-table-row tx-table-row--${tx.type}`}
                    >
                      <td className="tx-title-cell" title={tx.title}>{tx.title}</td>
                      <td>
                        <span
                          className="tx-category-badge"
                          style={{
                            background: getCategoryColor(tx.category) + '22',
                            color: getCategoryColor(tx.category),
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(tx.date)}</td>
                      <td>
                        <span className={`badge badge-${tx.type}`}>
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`tx-amount--${tx.type}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 'INR')}
                      </td>
                      <td>
                        <div className="tx-actions-cell">
                          <button
                            className="tx-action-btn"
                            onClick={() => handleEdit(tx)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="tx-action-btn tx-action-btn--delete"
                            onClick={() => handleDeleteClick(tx)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="tx-mobile-list">
                {transactions.map((tx) => (
                  <div key={tx._id} className={`tx-mobile-card tx-mobile-card--${tx.type}`}>
                    <div className="tx-mobile-info">
                      <div className="tx-mobile-title">{tx.title}</div>
                      <div className="tx-mobile-meta">{tx.category} · {formatDate(tx.date)}</div>
                    </div>
                    <div className="tx-mobile-right">
                      <div className={`tx-mobile-amount tx-amount--${tx.type}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 'INR')}
                      </div>
                      <div className="tx-mobile-actions">
                        <button className="tx-action-btn" onClick={() => handleEdit(tx)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="tx-action-btn tx-action-btn--delete" onClick={() => handleDeleteClick(tx)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && total > LIMIT && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing {startItem}–{endItem} of {total} transactions
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              {getPageNumbers().map((n) => (
                <button
                  key={n}
                  className={`pagination-btn ${n === page ? 'pagination-btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTransaction(null); }}
        transaction={editingTransaction}
        onSuccess={handleModalSuccess}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TransactionsPage;
