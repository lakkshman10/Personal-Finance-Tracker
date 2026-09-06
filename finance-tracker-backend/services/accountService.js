const accountRepository = require('../repositories/accountRepository');

const ALLOWED_TYPES = new Set([
  'BANK',
  'CASH',
  'CREDIT_CARD',
  'WALLET',
  'UPI',
  'INVESTMENT',
  'OTHER',
]);

const normalizeName = (name) => {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Account name is required.');
  }

  const value = name.trim();
  if (value.length > 120) throw new Error('Account name must be 120 characters or fewer.');
  return value;
};

const normalizeCurrency = (currency = 'INR') => {
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency.trim())) {
    throw new Error('Currency must be a 3-letter code.');
  }
  return currency.trim().toUpperCase();
};

const normalizeOpeningBalance = (value = 0) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Opening balance cannot be negative.');
  }
  return amount.toFixed(2);
};

const validateType = (type) => {
  if (!ALLOWED_TYPES.has(type)) throw new Error('Invalid account type.');
};

const accountService = {
  async list(userId, options = {}) {
    return accountRepository.findByUserId(userId, options);
  },

  async create(userId, input) {
    const { name, type, institution = null, currency = 'INR', openingBalance = 0 } = input || {};

    validateType(type);

    return accountRepository.create({
      userId,
      name: normalizeName(name),
      type,
      institution: institution ? String(institution).trim() : null,
      currency: normalizeCurrency(currency),
      openingBalance: normalizeOpeningBalance(openingBalance),
    });
  },

  async update(userId, id, input = {}) {
    const data = {};
    if (input.name !== undefined) data.name = normalizeName(input.name);
    if (input.type !== undefined) {
      validateType(input.type);
      data.type = input.type;
    }
    if (input.institution !== undefined) {
      data.institution = input.institution ? String(input.institution).trim() : null;
    }
    if (input.currency !== undefined) data.currency = normalizeCurrency(input.currency);
    if (input.openingBalance !== undefined) {
      data.openingBalance = normalizeOpeningBalance(input.openingBalance);
    }
    if (input.isActive !== undefined) {
      if (typeof input.isActive !== 'boolean') throw new Error('isActive must be boolean.');
      data.isActive = input.isActive;
    }

    if (Object.keys(data).length === 0) throw new Error('No valid account fields to update.');
    return accountRepository.updateByIdForUser(id, userId, data);
  },
};

module.exports = accountService;
