const prisma = require('../config/prisma');

const includePayments = {
  payments: {
    orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    include: { transaction: { include: { account: true, category: true } } },
  },
};

const debtRepository = {
  async findByUserId(userId, status) {
    return prisma.debt.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: [{ status: 'asc' }, { dueDay: 'asc' }, { createdAt: 'desc' }],
      include: includePayments,
    });
  },
  async findByIdForUser(id, userId) {
    return prisma.debt.findFirst({ where: { id, userId }, include: includePayments });
  },
  async create(data) { return prisma.debt.create({ data, include: includePayments }); },
  async updateByIdForUser(id, userId, data) {
    const result = await prisma.debt.updateMany({ where: { id, userId }, data });
    if (result.count === 0) return null;
    return debtRepository.findByIdForUser(id, userId);
  },
  async archiveByIdForUser(id, userId) {
    const result = await prisma.debt.updateMany({ where: { id, userId, status: { not: 'ARCHIVED' } }, data: { status: 'ARCHIVED' } });
    return result.count > 0;
  },
  async restoreByIdForUser(id, userId, status) {
    const result = await prisma.debt.updateMany({ where: { id, userId, status: 'ARCHIVED' }, data: { status } });
    return result.count > 0;
  },
  async deleteByIdForUser(id, userId) {
    return prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findFirst({ where: { id, userId }, include: { _count: { select: { payments: true } } } });
      if (!debt) return { found: false, deleted: false, hasPayments: false };
      if (debt._count.payments > 0) return { found: true, deleted: false, hasPayments: true };
      await tx.debt.delete({ where: { id } });
      return { found: true, deleted: true, hasPayments: false };
    });
  },
  async createPaymentAndTransaction({ debtId, userId, transaction, payment, expectedOutstandingAmount, outstandingAmount, status }) {
    return prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.transaction.create({ data: transaction });
      await tx.debtPayment.create({ data: { ...payment, transactionId: createdTransaction.id } });

      // Compare-and-swap the outstanding amount so concurrent payments cannot
      // both calculate from the same stale balance and overwrite each other.
      const updatedDebt = await tx.debt.updateMany({
        where: { id: debtId, userId, outstandingAmount: expectedOutstandingAmount },
        data: { outstandingAmount, status },
      });
      if (updatedDebt.count !== 1) {
        throw new Error('Debt balance changed while recording this payment. Please retry the payment.');
      }

      return createdTransaction;
    });
  },
  async deletePaymentAndTransaction({ paymentId, debtId, userId, expectedOutstandingAmount, outstandingAmount, status }) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.findFirst({ where: { id: paymentId, userId, debtId } });
      if (!payment) return false;

      await tx.debtPayment.delete({ where: { id: paymentId } });
      await tx.transaction.delete({ where: { id: payment.transactionId } });

      // Reversal also uses compare-and-swap to prevent concurrent reversals or
      // payments from silently overwriting the debt balance.
      const updatedDebt = await tx.debt.updateMany({
        where: { id: debtId, userId, outstandingAmount: expectedOutstandingAmount },
        data: { outstandingAmount, status },
      });
      if (updatedDebt.count !== 1) {
        throw new Error('Debt balance changed while reversing this payment. Please retry.');
      }

      return true;
    });
  },
};

module.exports = debtRepository;
