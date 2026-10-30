import api from './api';

export const transactionService = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  remove: (id) => api.delete(`/transactions/${id}`),
};

export const dashboardService = {
  getSummary: (params = {}) => api.get('/dashboard/summary', { params }),
  getCategoryBreakdown: (params = {}) => api.get('/dashboard/category-breakdown', { params }),
  getMonthlyTrends: () => api.get('/dashboard/monthly-trends'),
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

