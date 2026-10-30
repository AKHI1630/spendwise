export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    label: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
  };
};

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Scholarship', 'Business', 'Investment', 'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transport', 'Education', 'Entertainment',
  'Health', 'Bills', 'Rent', 'Travel', 'Other Expense',
];

export const getCategoriesForType = (type) => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const getCategoryColor = (category) => {
  const colors = {
    Salary: '#16A36A', Freelance: '#34D399', Scholarship: '#6EE7B7',
    Business: '#059669', Investment: '#047857', 'Other Income': '#10B981',
    Food: '#EF4444', Shopping: '#F97316', Transport: '#EAB308',
    Education: '#3B82F6', Entertainment: '#8B5CF6', Health: '#EC4899',
    Bills: '#F59E0B', Rent: '#DC2626', Travel: '#06B6D4', 'Other Expense': '#6B7280',
  };
  return colors[category] || '#6B7280';
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

