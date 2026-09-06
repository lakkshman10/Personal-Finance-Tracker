const budgetRepository = require('../repositories/budgetRepository');
const categoryRepository = require('../repositories/categoryRepository');
const prisma = require('../config/prisma');

const ALLOWED_DURATIONS = new Set(['MONTHLY', 'CUSTOM']);
const MAX_ADJUSTMENTS = 1;

const normalizeDate = (value, fieldName) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`Invalid ${fieldName}.`);
  return date;
};
const normalizeMonth = (value) => {
  const date = normalizeDate(value, 'Month');
  if (date.getUTCDate() !== 1) throw new Error('Month must be the first day of the month (YYYY-MM-01).');
  return date;
};
const normalizeAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Budget amount must be a positive number.');
  return amount.toFixed(2);
};
const normalizeAlertPercent = (value = 80) => {
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error('Alert percent must be between 0 and 100.');
  return percent.toFixed(2);
};
const validateDuration = (duration) => {
  if (!ALLOWED_DURATIONS.has(duration)) throw new Error('Invalid budget duration.');
};
const validateDates = (duration, startDate, endDate) => {
  if (duration === 'MONTHLY') {
    if (startDate || endDate) throw new Error('Monthly budgets cannot have custom start or end dates.');
    return { startDate: null, endDate: null };
  }
  if (!startDate || !endDate) throw new Error('Custom budgets require startDate and endDate.');
  const start = normalizeDate(startDate, 'Start date');
  const end = normalizeDate(endDate, 'End date');
  if (start > end) throw new Error('Start date cannot be after end date.');
  return { startDate: start, endDate: end };
};
const validateCategory = async (userId, categoryId) => {
  if (!categoryId) throw new Error('Category is required for a budget.');
  const category = await categoryRepository.findByIdForUser(categoryId, userId);
  if (!category || !category.isActive || category.type !== 'EXPENSE') throw new Error('Budget category must be an active expense category.');
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

    const changed = nextAmount !== existing.amount.toString() || nextAlertPercent !== existing.alertPercent.toString() || nextCategoryId !== existing.categoryId || nextMonth.getTime() !== existing.month.getTime() || nextDuration !== existing.duration;
    if (!changed) return existing;

    if (existing.adjustments.length >= MAX_ADJUSTMENTS) throw new Error('This budget has already been adjusted once. Further adjustments are not allowed.');
    if (!input.reason || typeof input.reason !== 'string' || !input.reason.trim()) throw new Error('A reason is required when adjusting a budget.');
    if (input.reason.trim().length > 500) throw new Error('Adjustment reason must be 500 characters or fewer.');

    await prisma.$transaction(async (tx) => {
      const result = await tx.budget.updateMany({ where: { id, userId }, data: { categoryId: nextCategoryId, month: nextMonth, amount: nextAmount, alertPercent: nextAlertPercent, duration: nextDuration, startDate: dates.startDate, endDate: dates.endDate } });
      if (result.count === 0) throw new Error('Budget not found.');
      await tx.budgetAdjustment.create({ data: { budgetId: id, oldAmount: existing.amount, newAmount: nextAmount, oldAlertPercent: existing.alertPercent, newAlertPercent: nextAlertPercent, reason: input.reason.trim() } });
    });
    return budgetRepository.findByIdForUser(id, userId);
  },
  async remove(userId, id) {
    return budgetRepository.deleteByIdForUser(id, userId);
  },
};

module.exports = budgetService;
