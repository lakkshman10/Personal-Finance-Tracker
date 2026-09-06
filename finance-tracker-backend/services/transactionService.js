const transactionRepository = require('../repositories/transactionRepository');

const ALLOWED_TYPES = new Set(['INCOME', 'EXPENSE', 'TRANSFER']);

const normalizeAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Amount must be a positive number.');
  }

  return value.toFixed(2);
};

const normalizeDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Transaction date is required and must use YYYY-MM-DD.');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid transaction date.');
  }

  return date;
};

const validateType = (type) => {
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error('Invalid transaction type.');
  }
};

const transactionService = {
  async list(userId, options) {
    return transactionRepository.findByUserId(userId, options);
  },

  async create(userId, input = {}) {
    const {
      accountId,
      categoryId = null,
      type,
      amount,
      description,
      notes = null,
      transactionDate,
    } = input;

    if (!accountId || !type || typeof description !== 'string' || !description.trim() || !transactionDate) {
      throw new Error('Account, type, description, and transaction date are required.');
    }

    validateType(type);

    return transactionRepository.create({
      userId,
      accountId,
      categoryId,
      type,
      amount: normalizeAmount(amount),
      description: description.trim(),
      transactionDate: normalizeDate(transactionDate),
      notes: notes ? String(notes).trim() : null,
    });
  },
};

module.exports = transactionService;
