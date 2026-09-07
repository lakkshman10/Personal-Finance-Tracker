const crypto = require('crypto');
const prisma = require('../config/prisma');

const includeRelations = { account: true, category: true };

async function assertTransferAccounts(tx, userId, sourceAccountId, destinationAccountId) {
  if (!sourceAccountId || !destinationAccountId) throw new Error('Source and destination accounts are required for transfers.');
  if (sourceAccountId === destinationAccountId) throw new Error('Source and destination accounts must be different.');

  const accounts = await tx.account.findMany({
    where: { userId, id: { in: [sourceAccountId, destinationAccountId] }, isActive: true },
    select: { id: true },
  });
  if (accounts.length !== 2) throw new Error('Both transfer accounts must belong to you and be active.');
}

async function assertCompleteTransferGroup(tx, transferGroupId, userId) {
  const rows = await tx.transaction.findMany({
    where: { transferGroupId, userId, type: 'TRANSFER' },
    select: { id: true, transferDirection: true },
  });
  if (rows.length !== 2 || !rows.some((row) => row.transferDirection === 'OUT') || !rows.some((row) => row.transferDirection === 'IN')) {
    throw new Error('Transfer is incomplete or corrupted and cannot be modified.');
  }
  return rows;
}

const transactionRepository = {
  async findByUserId(userId, options = {}) {
    const { fromDate, toDate, type, limit = 100, offset = 0 } = options;
    return prisma.transaction.findMany({
      where: {
        userId,
        ...(fromDate || toDate ? { transactionDate: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(Math.max(Number(limit) || 100, 1), 500),
      skip: Math.max(Number(offset) || 0, 0),
      include: includeRelations,
    });
  },

  async findByIdForUser(id, userId) {
    return prisma.transaction.findFirst({ where: { id, userId }, include: includeRelations });
  },

  async create(data) {
    return prisma.transaction.create({ data, include: includeRelations });
  },

  async createTransfer({ userId, sourceAccountId, destinationAccountId, amount, description, transactionDate, notes }) {
    const transferGroupId = crypto.randomUUID();
    return prisma.$transaction(async (tx) => {
      await assertTransferAccounts(tx, userId, sourceAccountId, destinationAccountId);
      await tx.transaction.create({ data: { userId, accountId: sourceAccountId, categoryId: null, type: 'TRANSFER', amount, description, transactionDate, notes, transferGroupId, transferDirection: 'OUT' } });
      await tx.transaction.create({ data: { userId, accountId: destinationAccountId, categoryId: null, type: 'TRANSFER', amount, description, transactionDate, notes, transferGroupId, transferDirection: 'IN' } });
      return tx.transaction.findMany({ where: { userId, transferGroupId }, orderBy: { transferDirection: 'asc' }, include: includeRelations });
    });
  },

  async findTransferGroupForUser(transferGroupId, userId) {
    return prisma.transaction.findMany({ where: { transferGroupId, userId, type: 'TRANSFER' }, orderBy: { transferDirection: 'asc' }, include: includeRelations });
  },

  async updateTransferGroupForUser(transferGroupId, userId, data) {
    return prisma.$transaction(async (tx) => {
      const existing = await assertCompleteTransferGroup(tx, transferGroupId, userId);
      await assertTransferAccounts(tx, userId, data.sourceAccountId, data.destinationAccountId);
      const out = existing.find((r) => r.transferDirection === 'OUT');
      const incoming = existing.find((r) => r.transferDirection === 'IN');
      const common = { amount: data.amount, description: data.description, transactionDate: data.transactionDate, notes: data.notes, categoryId: null, type: 'TRANSFER' };
      await tx.transaction.update({ where: { id: out.id }, data: { ...common, accountId: data.sourceAccountId } });
      await tx.transaction.update({ where: { id: incoming.id }, data: { ...common, accountId: data.destinationAccountId } });
      return tx.transaction.findMany({ where: { transferGroupId, userId }, orderBy: { transferDirection: 'asc' }, include: includeRelations });
    });
  },

  async deleteTransferGroupForUser(transferGroupId, userId) {
    return prisma.$transaction(async (tx) => {
      await assertCompleteTransferGroup(tx, transferGroupId, userId);
      const result = await tx.transaction.deleteMany({ where: { transferGroupId, userId, type: 'TRANSFER' } });
      if (result.count !== 2) throw new Error('Transfer deletion did not remove exactly two linked transactions.');
      return result.count;
    });
  },

  async updateByIdForUser(id, userId, data) {
    const result = await prisma.transaction.updateMany({ where: { id, userId }, data });
    if (result.count === 0) return null;
    return transactionRepository.findByIdForUser(id, userId);
  },

  async deleteByIdForUser(id, userId) {
    const result = await prisma.transaction.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },
};

module.exports = transactionRepository;
