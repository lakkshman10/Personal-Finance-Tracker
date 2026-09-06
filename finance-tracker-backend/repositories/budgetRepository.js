const prisma = require('../config/prisma');

const budgetRepository = {
  async findByUserId(userId, options = {}) {
    const { month } = options;

    return prisma.budget.findMany({
      where: {
        userId,
        ...(month ? { month } : {}),
      },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        adjustments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  async findByIdForUser(id, userId) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: true,
        adjustments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  async create(data) {
    return prisma.budget.create({
      data,
      include: { category: true, adjustments: true },
    });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.budget.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) return null;
    return budgetRepository.findByIdForUser(id, userId);
  },

  async createAdjustment(data) {
    return prisma.budgetAdjustment.create({ data });
  },
};

module.exports = budgetRepository;
