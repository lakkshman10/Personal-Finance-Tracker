const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const includeContributions = { contributions: { orderBy: [{ contributionDate: 'desc' }, { createdAt: 'desc' }] } };
const lockGoal = async (tx, id, userId) => { const rows = await tx.$queryRaw`SELECT id FROM savings_goals WHERE id = ${id}::uuid AND user_id = ${userId}::uuid FOR UPDATE`; return rows.length > 0; };
const getCurrentSaved = async (tx, goalId, userId) => { const aggregate = await tx.savingsGoalContribution.aggregate({ where: { goalId, userId }, _sum: { amount: true } }); return Number(aggregate._sum.amount || 0); };
const savingsGoalRepository = {
  async findByUserId(userId) { return prisma.savingsGoal.findMany({ where: { userId, isActive: true }, orderBy: [{ isActive: 'desc' }, { targetDate: 'asc' }, { createdAt: 'desc' }], include: includeContributions }); },
  async findByIdForUser(id, userId) { return prisma.savingsGoal.findFirst({ where: { id, userId }, include: includeContributions }); },
  async create(data) { return prisma.savingsGoal.create({ data, include: includeContributions }); },
  async updateByIdForUser(id, userId, data) { return prisma.$transaction(async (tx) => { const locked = await lockGoal(tx, id, userId); if (!locked) return null; const existing = await tx.savingsGoal.findFirst({ where: { id, userId, isActive: true } }); if (!existing) return null; if (data.targetAmount !== undefined) { const currentSaved = await getCurrentSaved(tx, id, userId); if (Number(data.targetAmount) < currentSaved) throw new AppError('Target amount cannot be less than the amount already saved.'); } return tx.savingsGoal.update({ where: { id }, data, include: includeContributions }); }); },
  async deleteByIdForUser(id, userId) { const result = await prisma.savingsGoal.updateMany({ where: { id, userId }, data: { isActive: false } }); return result.count > 0; },
  async createContribution(data) { return prisma.$transaction(async (tx) => { const locked = await lockGoal(tx, data.goalId, data.userId); if (!locked) return null; const goal = await tx.savingsGoal.findFirst({ where: { id: data.goalId, userId: data.userId, isActive: true } }); if (!goal) return null; const currentSaved = await getCurrentSaved(tx, data.goalId, data.userId); if (currentSaved + Number(data.amount) > Number(goal.targetAmount)) throw new AppError('Contribution would exceed the target amount.', 409); await tx.savingsGoalContribution.create({ data }); return tx.savingsGoal.findFirst({ where: { id: data.goalId, userId: data.userId }, include: includeContributions }); }); },
  async deleteContributionForUser(id, userId) { return prisma.$transaction(async (tx) => { const contribution = await tx.savingsGoalContribution.findFirst({ where: { id, userId } }); if (!contribution) return false; const locked = await lockGoal(tx, contribution.goalId, userId); if (!locked) return false; const result = await tx.savingsGoalContribution.deleteMany({ where: { id, userId } }); return result.count > 0; }); },
};
module.exports = savingsGoalRepository;
