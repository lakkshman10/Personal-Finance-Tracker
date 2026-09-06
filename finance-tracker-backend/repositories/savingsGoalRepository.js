const prisma = require('../config/prisma');

const includeContributions = {
  contributions: { orderBy: [{ contributionDate: 'desc' }, { createdAt: 'desc' }] },
};

const savingsGoalRepository = {
  async findByUserId(userId) {
    return prisma.savingsGoal.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isActive: 'desc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
      include: includeContributions,
    });
  },
  async findByIdForUser(id, userId) {
    return prisma.savingsGoal.findFirst({ where: { id, userId }, include: includeContributions });
  },
  async create(data) {
    return prisma.savingsGoal.create({ data, include: includeContributions });
  },
  async updateByIdForUser(id, userId, data) {
    const result = await prisma.savingsGoal.updateMany({ where: { id, userId }, data });
    if (result.count === 0) return null;
    return savingsGoalRepository.findByIdForUser(id, userId);
  },
  async deleteByIdForUser(id, userId) {
    const result = await prisma.savingsGoal.updateMany({ where: { id, userId }, data: { isActive: false } });
    return result.count > 0;
  },
  async createContribution(data) {
    return prisma.savingsGoalContribution.create({ data });
  },
  async deleteContributionForUser(id, userId) {
    const result = await prisma.savingsGoalContribution.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },
};

module.exports = savingsGoalRepository;
