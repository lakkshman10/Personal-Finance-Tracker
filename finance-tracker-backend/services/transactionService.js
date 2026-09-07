const AppError = require('../utils/AppError');
const transactionRepository = require('../repositories/transactionRepository');
const accountRepository = require('../repositories/accountRepository');
const categoryRepository = require('../repositories/categoryRepository');
const ALLOWED_TYPES = new Set(['INCOME', 'EXPENSE', 'TRANSFER']);
const normalizeAmount = (amount) => { const value = Number(amount); if (!Number.isFinite(value) || value <= 0) throw new AppError('Amount must be a positive number.'); if (value > 999999999999.99) throw new AppError('Amount is too large.'); return value.toFixed(2); };
const normalizeDate = (value) => { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError('Transaction date must use YYYY-MM-DD format.'); const date = new Date(`${value}T00:00:00.000Z`); if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new AppError('Invalid transaction date.'); return date; };
const normalizeDescription = (value) => { if (typeof value !== 'string' || !value.trim()) throw new AppError('Description is required.'); const description = value.trim(); if (description.length > 255) throw new AppError('Description must be 255 characters or fewer.'); return description; };
const normalizeNotes = (value) => value === null || value === undefined ? null : String(value).trim() || null;
const validateType = (type) => { if (!ALLOWED_TYPES.has(type)) throw new AppError('Invalid transaction type.'); };
const validateReferences = async (userId, accountId, categoryId, type) => { const account = await accountRepository.findByIdForUser(accountId, userId); if (!account || !account.isActive) throw new AppError('Invalid or inactive account.'); if (type === 'TRANSFER') { if (categoryId) throw new AppError('Transfers cannot have a category.'); return; } if (!categoryId) throw new AppError('Category is required for income and expense transactions.'); const category = await categoryRepository.findByIdForUser(categoryId, userId); if (!category || !category.isActive || category.type !== type) throw new AppError(`Category must be an active ${type === 'EXPENSE' ? 'expense' : 'income'} category.`); };
const normalizePagination = (options) => { const limit = options.limit === undefined || options.limit === '' ? 100 : Number(options.limit); const offset = options.offset === undefined || options.offset === '' ? 0 : Number(options.offset); if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new AppError('limit must be an integer between 1 and 500.'); if (!Number.isInteger(offset) || offset < 0) throw new AppError('offset must be a non-negative integer.'); return { limit, offset }; };
const transactionService = {
  async list(userId, options = {}) { const normalized = { ...options, ...normalizePagination(options) }; if (normalized.type !== undefined) validateType(normalized.type); if (normalized.fromDate) normalized.fromDate = normalizeDate(normalized.fromDate); if (normalized.toDate) normalized.toDate = normalizeDate(normalized.toDate); if (normalized.fromDate && normalized.toDate && normalized.fromDate > normalized.toDate) throw new AppError('fromDate cannot be after toDate.'); return transactionRepository.findByUserId(userId, normalized); },
  async create(userId, input = {}) { const { accountId, destinationAccountId = null, categoryId = null, type, amount, description, notes = null, transactionDate } = input; if (!accountId || !type) throw new AppError('Account and transaction type are required.'); validateType(type); const normalizedAmount = normalizeAmount(amount); const normalizedDescription = normalizeDescription(description); const normalizedDate = normalizeDate(transactionDate); const normalizedNotes = normalizeNotes(notes); if (type === 'TRANSFER') { if (categoryId) throw new AppError('Transfers cannot have a category.'); if (!destinationAccountId) throw new AppError('Destination account is required for transfers.'); return transactionRepository.createTransfer({ userId, sourceAccountId: accountId, destinationAccountId, amount: normalizedAmount, description: normalizedDescription, transactionDate: normalizedDate, notes: normalizedNotes }); } if (destinationAccountId) throw new AppError('Destination account is only valid for transfers.'); await validateReferences(userId, accountId, categoryId, type); return transactionRepository.create({ userId, accountId, categoryId, type, amount: normalizedAmount, description: normalizedDescription, transactionDate: normalizedDate, notes: normalizedNotes }); },
  async update(userId, id, input = {}) {
    const existing = await transactionRepository.findByIdForUser(id, userId);
    if (!existing) return null;
    const debtPayment = await transactionRepository.findDebtPaymentByTransactionIdForUser(id, userId);
    if (debtPayment) throw new AppError('Debt payment transactions must be changed through Debt Management.', 409);
    if (existing.type === 'TRANSFER' || input.type === 'TRANSFER') {
      if (existing.type !== 'TRANSFER') throw new AppError('Changing an income or expense into a transfer is not supported. Delete it and create a transfer instead.');
      if (!existing.transferGroupId || !existing.transferDirection) throw new AppError('This legacy transfer cannot be edited safely. Delete it and create a new transfer.', 409);
      if (input.type !== undefined && input.type !== 'TRANSFER') throw new AppError('A transfer cannot be changed into an income or expense transaction. Delete it and create a new transaction.');
      if (input.categoryId) throw new AppError('Transfers cannot have a category.');

      // A transfer is a pair. Always resolve source/destination from the group,
      // regardless of whether the caller is editing the OUT or IN row.
      const group = await transactionRepository.findTransferGroupForUser(existing.transferGroupId, userId);
      const outgoing = group.find((row) => row.transferDirection === 'OUT');
      const incoming = group.find((row) => row.transferDirection === 'IN');
      if (!outgoing || !incoming) throw new AppError('Transfer is incomplete or corrupted and cannot be edited.', 409);

      const sourceAccountId = input.accountId !== undefined
        ? input.accountId
        : outgoing.accountId;
      const destinationAccountId = input.destinationAccountId !== undefined
        ? input.destinationAccountId
        : incoming.accountId;

      // If the UI edits the incoming row and sends accountId, that account is the
      // destination, not the source. destinationAccountId remains the explicit
      // transfer destination field when supplied.
      const normalizedSourceAccountId = existing.transferDirection === 'IN' && input.accountId !== undefined
        ? outgoing.accountId
        : sourceAccountId;
      const normalizedDestinationAccountId = existing.transferDirection === 'IN' && input.accountId !== undefined
        ? input.accountId
        : destinationAccountId;

      if (input.accountId !== undefined && input.destinationAccountId === undefined && existing.transferDirection === 'IN') {
        // Incoming-row account selection is the destination selection.
        return transactionRepository.updateTransferGroupForUser(existing.transferGroupId, userId, {
          sourceAccountId: normalizedSourceAccountId,
          destinationAccountId: normalizedDestinationAccountId,
          amount: input.amount !== undefined ? normalizeAmount(input.amount) : existing.amount,
          description: input.description !== undefined ? normalizeDescription(input.description) : existing.description,
          transactionDate: input.transactionDate !== undefined ? normalizeDate(input.transactionDate) : existing.transactionDate,
          notes: input.notes !== undefined ? normalizeNotes(input.notes) : existing.notes,
        });
      }

      return transactionRepository.updateTransferGroupForUser(existing.transferGroupId, userId, {
        sourceAccountId: normalizedSourceAccountId,
        destinationAccountId: normalizedDestinationAccountId,
        amount: input.amount !== undefined ? normalizeAmount(input.amount) : existing.amount,
        description: input.description !== undefined ? normalizeDescription(input.description) : existing.description,
        transactionDate: input.transactionDate !== undefined ? normalizeDate(input.transactionDate) : existing.transactionDate,
        notes: input.notes !== undefined ? normalizeNotes(input.notes) : existing.notes,
      });
    }
    if (input.destinationAccountId) throw new AppError('Destination account is only valid for transfers.');
    const nextType = input.type ?? existing.type;
    const nextAccountId = input.accountId ?? existing.accountId;
    const nextCategoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;
    validateType(nextType);
    await validateReferences(userId, nextAccountId, nextCategoryId, nextType);
    const data = {};
    if (input.accountId !== undefined) data.accountId = input.accountId;
    if (input.categoryId !== undefined || input.type !== undefined) data.categoryId = nextCategoryId;
    if (input.type !== undefined) data.type = nextType;
    if (input.amount !== undefined) data.amount = normalizeAmount(input.amount);
    if (input.description !== undefined) data.description = normalizeDescription(input.description);
    if (input.transactionDate !== undefined) data.transactionDate = normalizeDate(input.transactionDate);
    if (input.notes !== undefined) data.notes = normalizeNotes(input.notes);
    if (Object.keys(data).length === 0) throw new AppError('No valid transaction fields to update.');
    return transactionRepository.updateByIdForUser(id, userId, data);
  },
  async remove(userId, id) { const existing = await transactionRepository.findByIdForUser(id, userId); if (!existing) return false; const debtPayment = await transactionRepository.findDebtPaymentByTransactionIdForUser(id, userId); if (debtPayment) throw new AppError('Debt payment transactions must be removed through Debt Management.', 409); if (existing.type === 'TRANSFER') { if (!existing.transferGroupId || !existing.transferDirection) throw new AppError('This legacy transfer cannot be deleted safely.', 409); const deletedCount = await transactionRepository.deleteTransferGroupForUser(existing.transferGroupId, userId); return deletedCount === 2; } return transactionRepository.deleteByIdForUser(id, userId); },
};
module.exports = transactionService;
