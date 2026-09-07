import api from './api';

// PostgreSQL-backed financial API client.
const financeApi = {
  accounts: {
    list: (params) => api.get('/accounts', { params }),
    create: (data) => api.post('/accounts', data),
    update: (id, data) => api.patch(`/accounts/${id}`, data),
  },
  userAccount: {
    get: () => api.get('/auth/account'),
    update: (data) => api.patch('/auth/account', data),
    changePassword: (data) => api.post('/auth/account/password', data),
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
  savingsGoals: {
    list: () => api.get('/savings-goals'),
    create: (data) => api.post('/savings-goals', data),
    update: (id, data) => api.patch(`/savings-goals/${id}`, data),
    remove: (id) => api.delete(`/savings-goals/${id}`),
    addContribution: (id, data) => api.post(`/savings-goals/${id}/contributions`, data),
    removeContribution: (contributionId) => api.delete(`/savings-goals/contributions/${contributionId}`),
  },
  debts: {
    list: (status = 'ACTIVE') => api.get('/debts', { params: { status } }),
    create: (data) => api.post('/debts', data),
    update: (id, data) => api.patch(`/debts/${id}`, data),
    archive: (id) => api.post(`/debts/${id}/archive`),
    restore: (id) => api.post(`/debts/${id}/restore`),
    remove: (id) => api.delete(`/debts/${id}`),
    addPayment: (id, data) => api.post(`/debts/${id}/payments`, data),
    removePayment: (id, paymentId) => api.delete(`/debts/${id}/payments/${paymentId}`),
  },
  reports: {
    summary: () => api.get('/reports/summary'),
  },
};

export default financeApi;
