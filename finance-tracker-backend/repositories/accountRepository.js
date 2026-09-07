const prisma = require('../config/prisma');

const accountRepository = {
  async findByUserId(userId, options = {}) {
    const { activeOnly = false } = options;
    const accounts = await prisma.account.findMany({
      where: { userId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    if (!accounts.length) return accounts;

    const grouped = await prisma.transaction.groupBy({
      by: ['accountId', 'type', 'transferDirection'],
      where: { userId, accountId: { in: accounts.map((account) => account.id) } },
      _sum: { amount: true },
    });

    const movements = new Map(accounts.map((account) => [account.id, 0]));
    grouped.forEach((row) => {
      const amount = Number(row._sum.amount || 0);
      const sign = row.type === 'INCOME' || (row.type === 'TRANSFER' && row.transferDirection === 'IN') ? 1 : -1;
      movements.set(row.accountId, (movements.get(row.accountId) || 0) + (sign * amount));
    });

    return accounts.map((account) => ({
      ...account,
      currentBalance: (Number(account.openingBalance) + (movements.get(account.id) || 0)).toFixed(2),
    }));
  },

  async findByIdForUser(id, userId) {
    return prisma.account.findFirst({ where: { id, userId } });
  },

  async create(data) {
    return prisma.account.create({ data });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.account.updateMany({ where: { id, userId }, data });
    if (result.count === 0) return null;
    return accountRepository.findByIdForUser(id, userId);
  },
};

module.exports = accountRepository;
