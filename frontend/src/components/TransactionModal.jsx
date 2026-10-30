import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { getCategoriesForType, formatDateInput, getErrorMessage } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import './TransactionModal.css';

const TransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const toast = useToast();
  const isEdit = !!transaction;

  const today = formatDateInput(new Date());

  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: today,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setForm({
          title: transaction.title || '',
          amount: transaction.amount || '',
          type: transaction.type || 'expense',
          category: transaction.category || '',
          date: transaction.date ? formatDateInput(new Date(transaction.date)) : today,
          description: transaction.description || '',
        });
      } else {
        setForm({
          title: '',
          amount: '',
          type: 'expense',
          category: '',
          date: today,
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, transaction]);

  const handleTypeChange = (type) => {
    const categories = getCategoriesForType(type);
    setForm((prev) => ({
      ...prev,
      type,
      category: categories.includes(prev.category) ? prev.category : '',
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      newErrors.amount = 'Enter a valid amount greater than 0';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (isEdit) {
        await transactionService.update(transaction._id, payload);
        toast.success('Transaction updated successfully');
      } else {
        await transactionService.create(payload);
        toast.success('Transaction added successfully');
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const categories = getCategoriesForType(form.type);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="transaction-modal-header">
          <h2>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form className="transaction-modal-form" onSubmit={handleSubmit} noValidate>
          {/* Type Selector */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <TrendingUp size={16} />
                Income
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <TrendingDown size={16} />
                Expense
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-title">Title *</label>
            <input
              id="tx-title"
              type="text"
              className="form-input"
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Amount & Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">Amount (INR) *</label>
              <input
                id="tx-amount"
                type="number"
                className="form-input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-date">Date *</label>
              <input
                id="tx-date"
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-category">Category *</label>
            <select
              id="tx-category"
              className="form-select"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-desc">Description (optional)</label>
            <textarea
              id="tx-desc"
              className="form-textarea"
              placeholder="Add a note..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg modal-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
