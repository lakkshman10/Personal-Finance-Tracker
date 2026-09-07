const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const servicePath = path.resolve(__dirname, '../services/transactionService.js');
const transactionRepositoryPath = require.resolve('../repositories/transactionRepository');
const accountRepositoryPath = require.resolve('../repositories/accountRepository');
const categoryRepositoryPath = require.resolve('../repositories/categoryRepository');

function loadService({ repository = {}, accountRepository = {}, categoryRepository = {} } = {}) {
  require.cache[transactionRepositoryPath] = { id: transactionRepositoryPath, filename: transactionRepositoryPath, loaded: true, exports: repository };
  require.cache[accountRepositoryPath] = { id: accountRepositoryPath, filename: accountRepositoryPath, loaded: true, exports: accountRepository };
  require.cache[categoryRepositoryPath] = { id: categoryRepositoryPath, filename: categoryRepositoryPath, loaded: true, exports: categoryRepository };
  delete require.cache[servicePath];
  return require(servicePath);
}

test('creates a transfer through the atomic transfer repository operation', async () => {
  let payload;
  const service = loadService({
    repository: { createTransfer: async (data) => { payload = data; return [{ transferDirection: 'OUT' }, { transferDirection: 'IN' }]; } },
  });

  const result = await service.create('user-1', {
    accountId: 'account-a',
    destinationAccountId: 'account-b',
    type: 'TRANSFER',
    amount: '1000.50',
    description: 'Move money',
    transactionDate: '2026-09-07',
  });

  assert.equal(result.length, 2);
  assert.deepEqual(payload, {
    userId: 'user-1',
    sourceAccountId: 'account-a',
    destinationAccountId: 'account-b',
    amount: '1000.50',
    description: 'Move money',
    transactionDate: new Date('2026-09-07T00:00:00.000Z'),
    notes: null,
  });
});

test('rejects transfers without a destination account', async () => {
  const service = loadService({ repository: { createTransfer: async () => { throw new Error('should not run'); } } });
  await assert.rejects(
    service.create('user-1', { accountId: 'account-a', type: 'TRANSFER', amount: 100, description: 'Move', transactionDate: '2026-09-07' }),
    /Destination account is required/
  );
});

test('rejects categories on transfers', async () => {
  const service = loadService({ repository: { createTransfer: async () => { throw new Error('should not run'); } } });
  await assert.rejects(
    service.create('user-1', { accountId: 'account-a', destinationAccountId: 'account-b', categoryId: 'category-1', type: 'TRANSFER', amount: 100, description: 'Move', transactionDate: '2026-09-07' }),
    /Transfers cannot have a category/
  );
});

test('rejects destinationAccountId on income and expense transactions', async () => {
  const service = loadService({ repository: { create: async () => ({}) } });
  await assert.rejects(
    service.create('user-1', { accountId: 'account-a', destinationAccountId: 'account-b', categoryId: 'category-1', type: 'EXPENSE', amount: 100, description: 'Expense', transactionDate: '2026-09-07' }),
    /Destination account is only valid for transfers/
  );
});

test('rejects zero, negative and non-finite amounts', async () => {
  const service = loadService({ repository: { create: async () => ({}) } });
  const base = { accountId: 'account-a', categoryId: 'category-1', type: 'EXPENSE', description: 'Expense', transactionDate: '2026-09-07' };
  await assert.rejects(service.create('user-1', { ...base, amount: 0 }), /positive number/);
  await assert.rejects(service.create('user-1', { ...base, amount: -1 }), /positive number/);
  await assert.rejects(service.create('user-1', { ...base, amount: 'not-a-number' }), /positive number/);
});

test('removes both sides of a valid transfer as one repository operation', async () => {
  let groupDeleted;
  const service = loadService({
    repository: {
      findByIdForUser: async () => ({ id: 'tx-out', type: 'TRANSFER', transferGroupId: 'group-1', transferDirection: 'OUT' }),
      deleteTransferGroupForUser: async (groupId, userId) => { groupDeleted = { groupId, userId }; return 2; },
    },
  });

  assert.equal(await service.remove('user-1', 'tx-out'), true);
  assert.deepEqual(groupDeleted, { groupId: 'group-1', userId: 'user-1' });
});

test('refuses to mutate legacy one-sided transfers', async () => {
  const service = loadService({
    repository: { findByIdForUser: async () => ({ id: 'legacy', type: 'TRANSFER', transferGroupId: null, transferDirection: null }) },
  });

  await assert.rejects(
    service.update('user-1', 'legacy', { amount: 200 }),
    /legacy transfer cannot be edited safely/
  );
  await assert.rejects(
    service.remove('user-1', 'legacy'),
    /legacy transfer cannot be deleted safely/
  );
});
