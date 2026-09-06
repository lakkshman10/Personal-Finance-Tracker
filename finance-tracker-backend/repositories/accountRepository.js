const prisma = require('../config/prisma');

const accountRepository = {
  async findByUserId(userId, options = {}) {
    const { activeOnly = false } = options;

    return prisma.account.findMany({
      where: {
        userId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  },

  async findByIdForUser(id, userId) {
    return prisma.account.findFirst({
      where: { id, userId },
    });
  },

  async create(data) {
    return prisma.account.create({ data });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.account.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) return null;
    return accountRepository.findByIdForUser(id, userId);
  },
};

module.exports = accountRepository;
