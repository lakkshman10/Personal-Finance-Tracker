import api from './api';

// PostgreSQL-backed financial API client.
const financeApi = {
  accounts: {
    list: (params) => api.get('/accounts', { params }),
    create: (data) => api.post('/accounts', data),
    update: (id, data) => api.patch(`/accounts/${id}`, data),
  },
  categories: {
    list: (type) => api.get('/categories', { params: type ? { type } : undefined }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.patch(`/categories/${id}`, data),
  },
  transactions: {
    list: (params) => api.get('/transactions', { params }),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.patch(`/transactions/${id}`, data),
    remove: (id) => api.delete(`/transactions/${id}`),
  },
  budgets: {
    list: (month) => api.get('/postgres/budgets', { params: month ? { month } : undefined }),
    create: (data) => api.post('/postgres/budgets', data),
    update: (id, data) => api.patch(`/postgres/budgets/${id}`, data),
    remove: (id) => api.delete(`/postgres/budgets/${id}`),
  },
};

export default financeApi;
