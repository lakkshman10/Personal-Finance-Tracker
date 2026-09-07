const debtRepository = require('../repositories/debtRepository');
const accountRepository = require('../repositories/accountRepository');
const categoryRepository = require('../repositories/categoryRepository');

const normalizeMoney = (value, field, { allowZero = false } = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    throw new Error(`${field} must be ${allowZero ? 'zero or a positive number' : 'a positive number'}.`);
  }
  if (number > 999999999999.99) throw new Error(`${field} is too large.`);
  return number.toFixed(2);
};

const normalizeDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Payment date must use YYYY-MM-DD format.');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid payment date.');
  }
  return date;
};

const normalizeDebt = (debt) => {
  const principal = Number(debt.principalAmount);
  const outstanding = Number(debt.outstandingAmount);
  const paid = Math.max(0, principal - outstanding);

  return {
    ...debt,
    principalAmount: principal,
    outstandingAmount: outstanding,
    paidAmount: paid,
    progressPercent: principal > 0 ? Number(((paid / principal) * 100).toFixed(2)) : 0,
  };
};

const validateName = (name) => {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Debt name is required.');
  const value = name.trim();
  if (value.length > 120) throw new Error('Debt name must be 120 characters or fewer.');
  return value;
};

const validateDueDay = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error('Due day must be between 1 and 31.');
  }
  return day;
};

const validateInterest = (value) => {
  if (value === null || value === undefined || value === '') return '0.0000';
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error('Interest rate must be between 0 and 100 percent.');
  }
  return rate.toFixed(4);
};

const validateMinimumPayment = (value) => (
  value === null || value === undefined || value === ''
    ? null
    : normalizeMoney(value, 'Minimum payment')
);

const debtService = {
  async list(userId, status) {
    const debts = await debtRepository.findByUserId(userId, status);
    return debts.map(normalizeDebt);
  },

  async create(userId, input = {}) {
    const principalAmount = normalizeMoney(input.principalAmount, 'Principal amount');
    const outstandingAmount = input.outstandingAmount === undefined || input.outstandingAmount === ''
      ? principalAmount
      : normalizeMoney(input.outstandingAmount, 'Outstanding amount', { allowZero: true });

    if (Number(outstandingAmount) > Number(principalAmount)) {
      throw new Error('Outstanding amount cannot exceed principal amount.');
    }

    return normalizeDebt(await debtRepository.create({
      userId,
      name: validateName(input.name),
      principalAmount,
      outstandingAmount,
      interestRate: validateInterest(input.interestRate),
      minimumPayment: validateMinimumPayment(input.minimumPayment),
      dueDay: validateDueDay(input.dueDay),
      status: Number(outstandingAmount) === 0 ? 'PAID_OFF' : 'ACTIVE',
    }));
  },

  async update(userId, id, input = {}) {
    const existing = await debtRepository.findByIdForUser(id, userId);
    if (!existing) return null;
    if (existing.status === 'ARCHIVED') throw new Error('Restore the debt before editing it.');

    const data = {};
    if (input.name !== undefined) data.name = validateName(input.name);
    if (input.interestRate !== undefined) data.interestRate = validateInterest(input.interestRate);
    if (input.minimumPayment !== undefined) data.minimumPayment = validateMinimumPayment(input.minimumPayment);
    if (input.dueDay !== undefined) data.dueDay = validateDueDay(input.dueDay);

    if (input.principalAmount !== undefined) {
      const principal = Number(normalizeMoney(input.principalAmount, 'Principal amount'));
      const hasPaymentHistory = Array.isArray(existing.payments) && existing.payments.length > 0;
      if (hasPaymentHistory) {
        throw new Error('Principal amount cannot be changed after payments have been recorded. Reverse the payment history first.');
      }
      if (principal < Number(existing.outstandingAmount)) {
        throw new Error('Principal amount cannot be below the outstanding amount.');
      }
      data.principalAmount = principal.toFixed(2);
    }

    if (Object.keys(data).length === 0) throw new Error('No valid debt fields to update.');
    return normalizeDebt(await debtRepository.updateByIdForUser(id, userId, data));
  },

  async archive(userId, id) {
    const debt = await debtRepository.findByIdForUser(id, userId);
    if (!debt) return null;
    if (debt.status === 'ARCHIVED') throw new Error('Debt is already archived.');

    const archived = await debtRepository.archiveByIdForUser(id, userId);
    if (!archived) return null;
    return normalizeDebt(await debtRepository.findByIdForUser(id, userId));
  },

  async restore(userId, id) {
    const debt = await debtRepository.findByIdForUser(id, userId);
    if (!debt) return null;
    if (debt.status !== 'ARCHIVED') throw new Error('Only archived debts can be restored.');

    const status = Number(debt.outstandingAmount) === 0 ? 'PAID_OFF' : 'ACTIVE';
    const restored = await debtRepository.restoreByIdForUser(id, userId, status);
    if (!restored) return null;
    return normalizeDebt(await debtRepository.findByIdForUser(id, userId));
  },

  async remove(userId, id) {
    const result = await debtRepository.deleteByIdForUser(id, userId);
    if (!result.found) return null;
    if (result.hasPayments) {
      throw new Error('Debt has payment history and cannot be permanently deleted. Reverse its payments first or archive it.');
    }
    return result.deleted;
  },

  async addPayment(userId, debtId, input = {}) {
    const debt = await debtRepository.findByIdForUser(debtId, userId);
    if (!debt) return null;
    if (debt.status === 'ARCHIVED') throw new Error('Restore the debt before recording payments.');
    if (Number(debt.outstandingAmount) <= 0) throw new Error('This debt is already paid off.');

    const amount = Number(normalizeMoney(input.amount, 'Payment amount'));
    if (amount > Number(debt.outstandingAmount)) throw new Error('Payment cannot exceed the outstanding debt.');

    const account = await accountRepository.findByIdForUser(input.accountId, userId);
    if (!account || !account.isActive) throw new Error('Invalid or inactive payment account.');

    const categoryId = input.categoryId || null;
    if (categoryId) {
      const category = await categoryRepository.findByIdForUser(categoryId, userId);
      if (!category || !category.isActive || category.type !== 'EXPENSE') {
        throw new Error('Payment category must be an active expense category.');
      }
    }

    const paymentDate = normalizeDate(input.paymentDate);
    const remaining = Number((Number(debt.outstandingAmount) - amount).toFixed(2));

    await debtRepository.createPaymentAndTransaction({
      debtId,
      transaction: {
        userId,
        accountId: input.accountId,
        categoryId,
        type: 'EXPENSE',
        amount: amount.toFixed(2),
        description: typeof input.description === 'string' && input.description.trim()
          ? input.description.trim().slice(0, 255)
          : `Debt payment: ${debt.name}`,
        transactionDate: paymentDate,
        notes: typeof input.notes === 'string' && input.notes.trim() ? input.notes.trim() : null,
      },
      payment: {
        debtId,
        userId,
        amount: amount.toFixed(2),
        paymentDate,
      },
      outstandingAmount: remaining.toFixed(2),
      status: remaining === 0 ? 'PAID_OFF' : 'ACTIVE',
    });

    return normalizeDebt(await debtRepository.findByIdForUser(debtId, userId));
  },

  async removePayment(userId, debtId, paymentId) {
    const debt = await debtRepository.findByIdForUser(debtId, userId);
    if (!debt) return null;
    if (debt.status === 'ARCHIVED') throw new Error('Restore the debt before reversing a payment.');

    const payment = debt.payments.find((item) => item.id === paymentId);
    if (!payment) return false;

    const restored = Number(debt.outstandingAmount) + Number(payment.amount);
    if (restored > Number(debt.principalAmount)) {
      throw new Error('Cannot reverse this payment because it would exceed the principal amount.');
    }

    await debtRepository.deletePaymentAndTransaction({
      paymentId,
      debtId,
      userId,
      outstandingAmount: restored.toFixed(2),
      status: restored === 0 ? 'PAID_OFF' : 'ACTIVE',
    });
    return true;
  },
};

module.exports = debtService;
