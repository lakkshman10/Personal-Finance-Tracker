const savingsGoalRepository = require('../repositories/savingsGoalRepository');

const normalizeDate = (value, fieldName) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`Invalid ${fieldName}.`);
  return date;
};

const normalizeAmount = (value, fieldName = 'Amount') => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`${fieldName} must be a positive number.`);
  if (amount > 999999999999.99) throw new Error(`${fieldName} is too large.`);
  return amount.toFixed(2);
};

const normalizeName = (value) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Goal name is required.');
  const name = value.trim();
  if (name.length > 120) throw new Error('Goal name must be 120 characters or fewer.');
  return name;
};

const normalizeDescription = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new Error('Description must be text.');
  const description = value.trim();
  if (description.length > 2000) throw new Error('Description must be 2000 characters or fewer.');
  return description || null;
};

const serialize = (goal) => {
  const contributions = goal.contributions || [];
  const currentSaved = contributions.reduce((sum, item) => sum + Number(item.amount), 0);
  const targetAmount = Number(goal.targetAmount);
  const remainingAmount = Math.max(targetAmount - currentSaved, 0);
  const progressPercent = targetAmount > 0 ? Math.min((currentSaved / targetAmount) * 100, 100) : 0;
  const completed = currentSaved >= targetAmount;
  const today = new Date();
  const targetDate = goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : null;
  const overdue = Boolean(targetDate && !completed && new Date(`${targetDate}T23:59:59.999Z`) < today);
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: targetAmount.toFixed(2),
    currentSaved: currentSaved.toFixed(2),
    remainingAmount: remainingAmount.toFixed(2),
    progressPercent: Number(progressPercent.toFixed(2)),
    targetDate,
    description: goal.description,
    status: completed ? 'COMPLETED' : overdue ? 'OVERDUE' : 'IN_PROGRESS',
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    contributions: contributions.map((item) => ({
      id: item.id,
      amount: Number(item.amount).toFixed(2),
      contributionDate: item.contributionDate.toISOString().slice(0, 10),
      note: item.note,
      createdAt: item.createdAt,
    })),
  };
};

const savingsGoalService = {
  async list(userId) {
    const goals = await savingsGoalRepository.findByUserId(userId);
    return goals.map(serialize);
  },

  async create(userId, input = {}) {
    const name = normalizeName(input.name);
    const targetAmount = normalizeAmount(input.targetAmount, 'Target amount');
    const targetDate = normalizeDate(input.targetDate, 'Target date');
    if (targetDate && targetDate < new Date(new Date().toISOString().slice(0, 10))) throw new Error('Target date cannot be in the past.');
    const goal = await savingsGoalRepository.create({
      userId,
      name,
      targetAmount,
      targetDate,
      description: normalizeDescription(input.description),
    });
    return serialize(goal);
  },

  async update(userId, id, input = {}) {
    const existing = await savingsGoalRepository.findByIdForUser(id, userId);
    if (!existing || !existing.isActive) return null;
    const name = input.name !== undefined ? normalizeName(input.name) : existing.name;
    const targetAmount = input.targetAmount !== undefined ? normalizeAmount(input.targetAmount, 'Target amount') : existing.targetAmount.toString();
    const targetDate = input.targetDate !== undefined ? normalizeDate(input.targetDate, 'Target date') : existing.targetDate;
    if (targetDate && targetDate < new Date(new Date().toISOString().slice(0, 10))) throw new Error('Target date cannot be in the past.');
    const currentSaved = (existing.contributions || []).reduce((sum, item) => sum + Number(item.amount), 0);
    if (Number(targetAmount) < currentSaved) throw new Error('Target amount cannot be less than the amount already saved.');
    const goal = await savingsGoalRepository.updateByIdForUser(id, userId, {
      name,
      targetAmount,
      targetDate,
      description: input.description !== undefined ? normalizeDescription(input.description) : existing.description,
    });
    return goal ? serialize(goal) : null;
  },

  async remove(userId, id) {
    const existing = await savingsGoalRepository.findByIdForUser(id, userId);
    if (!existing || !existing.isActive) return false;
    return savingsGoalRepository.deleteByIdForUser(id, userId);
  },

  async addContribution(userId, goalId, input = {}) {
    const goal = await savingsGoalRepository.findByIdForUser(goalId, userId);
    if (!goal || !goal.isActive) return null;
    const amount = normalizeAmount(input.amount, 'Contribution amount');
    const contributionDate = normalizeDate(input.contributionDate, 'Contribution date') || new Date(new Date().toISOString().slice(0, 10));
    if (contributionDate > new Date(new Date().toISOString().slice(0, 10))) throw new Error('Contribution date cannot be in the future.');
    const currentSaved = (goal.contributions || []).reduce((sum, item) => sum + Number(item.amount), 0);
    if (currentSaved + Number(amount) > Number(goal.targetAmount)) throw new Error('Contribution would exceed the target amount.');
    const note = input.note === undefined || input.note === null || input.note === '' ? null : String(input.note).trim();
    if (note && note.length > 255) throw new Error('Contribution note must be 255 characters or fewer.');
    await savingsGoalRepository.createContribution({ goalId, userId, amount, contributionDate, note: note || null });
    const updated = await savingsGoalRepository.findByIdForUser(goalId, userId);
    return serialize(updated);
  },

  async removeContribution(userId, contributionId) {
    return savingsGoalRepository.deleteContributionForUser(contributionId, userId);
  },
};

module.exports = savingsGoalService;
