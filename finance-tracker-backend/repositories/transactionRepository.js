const prisma = require('../config/prisma');

const transactionRepository = {
  async findByUserId(userId, options = {}) {
    const { fromDate, toDate, type, limit = 100, offset = 0 } = options;

    return prisma.transaction.findMany({
      where: {
        userId,
        ...(fromDate || toDate
          ? {
              transactionDate: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
        ...(type ? { type } : {}),
      },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(Math.max(Number(limit) || 100, 1), 500),
      skip: Math.max(Number(offset) || 0, 0),
      include: {
        account: true,
        category: true,
      },
    });
  },

  async findByIdForUser(id, userId) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        category: true,
      },
    });
  },

  async create(data) {
    return prisma.transaction.create({
      data,
      include: {
        account: true,
        category: true,
      },
    });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return transactionRepository.findByIdForUser(id, userId);
  },

  async deleteByIdForUser(id, userId) {
    const result = await prisma.transaction.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  },
};

module.exports = transactionRepository;
