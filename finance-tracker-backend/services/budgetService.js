const AppError = require('../utils/AppError');
const budgetRepository = require('../repositories/budgetRepository');
const categoryRepository = require('../repositories/categoryRepository');
const prisma = require('../config/prisma');

const ALLOWED_DURATIONS = new Set(['MONTHLY', 'CUSTOM']);
const MAX_ADJUSTMENTS = 1;
const MAX_BUDGET_AMOUNT = 999999999999.99;

const normalizeDate = (value, fieldName) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError(`${fieldName} must use YYYY-MM-DD format.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new AppError(`Invalid ${fieldName}.`);
  return date;
};
const normalizeMonth = (value) => {
  const date = normalizeDate(value, 'Month');
  if (date.getUTCDate() !== 1) throw new AppError('Month must be the first day of the month (YYYY-MM-01).');
  return date;
};
const normalizeAmount = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') throw new AppError('Budget amount must be a positive number.');
  const raw = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new AppError('Budget amount must be a valid number with at most 2 decimal places.');
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) throw new AppError('Budget amount must be a positive number.');
  if (amount > MAX_BUDGET_AMOUNT) throw new AppError('Budget amount cannot exceed 999999999999.99.');
  return amount.toFixed(2);
};
const normalizeAlertPercent = (value = 80) => {
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new AppError('Alert percent must be between 0 and 100.');
  return percent.toFixed(2);
};
const validateDuration = (duration) => {
  if (!ALLOWED_DURATIONS.has(duration)) throw new AppError('Invalid budget duration.');
};
const validateDates = (duration, startDate, endDate) => {
  if (duration === 'MONTHLY') {
    if (startDate || endDate) throw new AppError('Monthly budgets cannot have custom start or end dates.');
    return { startDate: null, endDate: null };
  }
  if (!startDate || !endDate) throw new AppError('Custom budgets require startDate and endDate.');
  const start = normalizeDate(startDate, 'Start date');
  const end = normalizeDate(endDate, 'End date');
  if (start > end) throw new AppError('Start date cannot be after end date.');
  return { startDate: start, endDate: end };
};
const validateCategory = async (userId, categoryId) => {
  if (!categoryId) throw new AppError('Category is required for a budget.');
  const category = await categoryRepository.findByIdForUser(categoryId, userId);
  if (!category || !category.isActive || category.type !== 'EXPENSE') throw new AppError('Budget category must be an active expense category.');
  return category;
};

const budgetService = {
  async list(userId, month) {
    return budgetRepository.findByUserId(userId, { month: month ? normalizeMonth(month) : undefined });
  },
  async create(userId, input = {}) {
    const { categoryId, month, amount, alertPercent = 80, duration = 'MONTHLY', startDate = null, endDate = null } = input;
    validateDuration(duration);
    await validateCategory(userId, categoryId);
    const normalizedMonth = normalizeMonth(month);
    const dates = validateDates(duration, startDate, endDate);
    return budgetRepository.create({ userId, categoryId, month: normalizedMonth, amount: normalizeAmount(amount), alertPercent: normalizeAlertPercent(alertPercent), duration, startDate: dates.startDate, endDate: dates.endDate });
  },
  async update(userId, id, input = {}) {
    const existing = await budgetRepository.findByIdForUser(id, userId);
    if (!existing) return null;
    const nextDuration = input.duration ?? existing.duration;
    validateDuration(nextDuration);
    const nextCategoryId = input.categoryId ?? existing.categoryId;
    await validateCategory(userId, nextCategoryId);
    const nextMonth = input.month !== undefined ? normalizeMonth(input.month) : existing.month;
    const nextAmount = input.amount !== undefined ? normalizeAmount(input.amount) : existing.amount.toString();
    const nextAlertPercent = input.alertPercent !== undefined ? normalizeAlertPercent(input.alertPercent) : existing.alertPercent.toString();
    const nextStartDate = input.startDate !== undefined ? input.startDate : existing.startDate?.toISOString().slice(0, 10) ?? null;
    const nextEndDate = input.endDate !== undefined ? input.endDate : existing.endDate?.toISOString().slice(0, 10) ?? null;
    const dates = validateDates(nextDuration, nextStartDate, nextEndDate);

    const changed = nextAmount !== existing.amount.toString() || nextAlertPercent !== existing.alertPercent.toString() || nextCategoryId !== existing.categoryId || nextMonth.getTime() !== existing.month.getTime() || nextDuration !== existing.duration || dates.startDate?.getTime() !== existing.startDate?.getTime() || dates.endDate?.getTime() !== existing.endDate?.getTime();
    if (!changed) return existing;

    if (existing.adjustments.length >= MAX_ADJUSTMENTS) throw new AppError('This budget has already been adjusted once. Further adjustments are not allowed.');
    if (!input.reason || typeof input.reason !== 'string' || !input.reason.trim()) throw new AppError('A reason is required when adjusting a budget.');
    if (input.reason.trim().length > 500) throw new AppError('Adjustment reason must be 500 characters or fewer.');

    await prisma.$transaction(async (tx) => {
      const lockedBudget = await tx.$queryRaw`SELECT id FROM budgets WHERE id = ${id} AND user_id = ${userId} FOR UPDATE`;
      if (lockedBudget.length === 0) throw new AppError('Budget not found.', 404);

      const current = await tx.budget.findFirst({ where: { id, userId }, include: { adjustments: { orderBy: { createdAt: 'asc' } } } });
      if (!current) throw new AppError('Budget not found.', 404);

      const currentStart = current.startDate?.getTime() ?? null;
      const currentEnd = current.endDate?.getTime() ?? null;
      const latestChanged = nextAmount !== current.amount.toString() || nextAlertPercent !== current.alertPercent.toString() || nextCategoryId !== current.categoryId || nextMonth.getTime() !== current.month.getTime() || nextDuration !== current.duration || dates.startDate?.getTime() !== currentStart || dates.endDate?.getTime() !== currentEnd;
      if (!latestChanged) return;
      if (current.adjustments.length >= MAX_ADJUSTMENTS) throw new AppError('This budget has already been adjusted once. Further adjustments are not allowed.');

      const result = await tx.budget.updateMany({ where: { id, userId }, data: { categoryId: nextCategoryId, month: nextMonth, amount: nextAmount, alertPercent: nextAlertPercent, duration: nextDuration, startDate: dates.startDate, endDate: dates.endDate } });
      if (result.count === 0) throw new AppError('Budget not found.', 404);
      await tx.budgetAdjustment.create({ data: { budgetId: id, oldAmount: current.amount, newAmount: nextAmount, oldAlertPercent: current.alertPercent, newAlertPercent: nextAlertPercent, reason: input.reason.trim() } });
    });
    return budgetRepository.findByIdForUser(id, userId);
  },
  async remove(userId, id) {
    return budgetRepository.deleteByIdForUser(id, userId);
  },
};

module.exports = budgetService;
