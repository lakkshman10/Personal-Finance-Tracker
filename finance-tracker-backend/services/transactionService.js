const transactionRepository = require('../repositories/transactionRepository');
const accountRepository = require('../repositories/accountRepository');
const categoryRepository = require('../repositories/categoryRepository');

const ALLOWED_TYPES = new Set(['INCOME', 'EXPENSE', 'TRANSFER']);

const normalizeAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Amount must be a positive number.');
  return value.toFixed(2);
};

const normalizeDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Transaction date must use YYYY-MM-DD format.');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid transaction date.');
  }
  return date;
};

const normalizeDescription = (value) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Description is required.');
  const description = value.trim();
  if (description.length > 255) throw new Error('Description must be 255 characters or fewer.');
  return description;
};

const validateType = (type) => {
  if (!ALLOWED_TYPES.has(type)) throw new Error('Invalid transaction type.');
};

const validateReferences = async (userId, accountId, categoryId, type) => {
  const account = await accountRepository.findByIdForUser(accountId, userId);
  if (!account || !account.isActive) throw new Error('Invalid or inactive account.');

  if (type === 'TRANSFER') {
    if (categoryId) throw new Error('Transfers cannot have a category.');
    return;
  }

  if (!categoryId) throw new Error('Category is required for income and expense transactions.');
  const category = await categoryRepository.findByIdForUser(categoryId, userId);
  if (!category || !category.isActive || category.type !== type) {
    throw new Error(`Category must be an active ${type === 'EXPENSE' ? 'expense' : 'income'} category.`);
  }
};

const transactionService = {
  async list(userId, options = {}) {
    const normalized = { ...options };
    if (normalized.type !== undefined) validateType(normalized.type);
    if (normalized.fromDate) normalized.fromDate = normalizeDate(normalized.fromDate);
    if (normalized.toDate) normalized.toDate = normalizeDate(normalized.toDate);
    if (normalized.fromDate && normalized.toDate && normalized.fromDate > normalized.toDate) {
      throw new Error('fromDate cannot be after toDate.');
    }
    return transactionRepository.findByUserId(userId, normalized);
  },

  async create(userId, input = {}) {
    const { accountId, categoryId = null, type, amount, description, notes = null, transactionDate } = input;
    if (!accountId || !type) throw new Error('Account and transaction type are required.');
    validateType(type);
    await validateReferences(userId, accountId, categoryId, type);

    return transactionRepository.create({
      userId,
      accountId,
      categoryId: type === 'TRANSFER' ? null : categoryId,
      type,
      amount: normalizeAmount(amount),
      description: normalizeDescription(description),
      transactionDate: normalizeDate(transactionDate),
      notes: notes === null || notes === undefined ? null : String(notes).trim() || null,
    });
  },

  async update(userId, id, input = {}) {
    const existing = await transactionRepository.findByIdForUser(id, userId);
    if (!existing) return null;

    const nextType = input.type ?? existing.type;
    const nextAccountId = input.accountId ?? existing.accountId;
    const nextCategoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;
    validateType(nextType);
    await validateReferences(userId, nextAccountId, nextCategoryId, nextType);

    const data = {};
    if (input.accountId !== undefined) data.accountId = input.accountId;
    if (input.categoryId !== undefined || input.type !== undefined) {
      data.categoryId = nextType === 'TRANSFER' ? null : nextCategoryId;
    }
    if (input.type !== undefined) data.type = nextType;
    if (input.amount !== undefined) data.amount = normalizeAmount(input.amount);
    if (input.description !== undefined) data.description = normalizeDescription(input.description);
    if (input.transactionDate !== undefined) data.transactionDate = normalizeDate(input.transactionDate);
    if (input.notes !== undefined) data.notes = input.notes === null ? null : String(input.notes).trim() || null;

    if (Object.keys(data).length === 0) throw new Error('No valid transaction fields to update.');
    return transactionRepository.updateByIdForUser(id, userId, data);
  },

  async remove(userId, id) {
    return transactionRepository.deleteByIdForUser(id, userId);
  },
};

module.exports = transactionService;
