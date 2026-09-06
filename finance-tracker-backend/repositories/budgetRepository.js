const prisma = require('../config/prisma');

const budgetInclude = {
  category: true,
  adjustments: { orderBy: { createdAt: 'asc' } },
};

const budgetRepository = {
  async findByUserId(userId, options = {}) {
    const { month } = options;
    return prisma.budget.findMany({
      where: { userId, ...(month ? { month } : {}) },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
      include: budgetInclude,
    });
  },
  async findByIdForUser(id, userId) {
    return prisma.budget.findFirst({ where: { id, userId }, include: budgetInclude });
  },
  async create(data) {
    return prisma.budget.create({ data, include: budgetInclude });
  },
  async updateByIdForUser(id, userId, data) {
    const result = await prisma.budget.updateMany({ where: { id, userId }, data });
    if (result.count === 0) return null;
    return budgetRepository.findByIdForUser(id, userId);
  },
  async deleteByIdForUser(id, userId) {
    const result = await prisma.budget.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },
};

module.exports = budgetRepository;
