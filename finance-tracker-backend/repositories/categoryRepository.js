const prisma = require('../config/prisma');

const categoryRepository = {
  async findAvailableForUser(userId, type) {
    return prisma.category.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        OR: [{ userId: null }, { userId }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  },

  async findByIdForUser(id, userId) {
    return prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId: null }, { userId }],
      },
    });
  },

  async findOwnedById(id, userId) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  async create(data) {
    return prisma.category.create({ data });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.category.updateMany({
      where: { id, userId },
      data,
    });

    if (result.count === 0) return null;
    return categoryRepository.findOwnedById(id, userId);
  },
};

module.exports = categoryRepository;
