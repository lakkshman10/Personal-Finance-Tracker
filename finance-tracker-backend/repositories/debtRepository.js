const prisma = require('../config/prisma');

const includePayments = {
  payments: {
    orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    include: { transaction: { include: { account: true } } },
  },
};

const debtRepository = {
  async findByUserId(userId) {
    return prisma.debt.findMany({ where: { userId }, orderBy: [{ status: 'asc' }, { dueDay: 'asc' }, { createdAt: 'desc' }], include: includePayments });
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
  async deleteByIdForUser(id, userId) {
    const result = await prisma.debt.updateMany({ where: { id, userId }, data: { status: 'ARCHIVED' } });
    return result.count > 0;
  },
  async createPaymentAndTransaction({ debtId, transaction, payment, outstandingAmount, status }) {
    return prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.transaction.create({ data: transaction });
      await tx.debtPayment.create({ data: { ...payment, transactionId: createdTransaction.id } });
      await tx.debt.update({ where: { id: debtId }, data: { outstandingAmount, status } });
      return createdTransaction;
    });
  },
  async deletePaymentAndTransaction({ paymentId, debtId, userId, outstandingAmount, status }) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.findFirst({ where: { id: paymentId, userId, debtId } });
      if (!payment) return false;
      await tx.debtPayment.delete({ where: { id: paymentId } });
      await tx.transaction.delete({ where: { id: payment.transactionId } });
      await tx.debt.update({ where: { id: debtId }, data: { outstandingAmount, status } });
      return true;
    });
  },
};

module.exports = debtRepository;
