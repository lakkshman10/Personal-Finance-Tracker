const prisma = require('../config/prisma');

const SYSTEM_CATEGORIES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Food', type: 'EXPENSE' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Travel', type: 'EXPENSE' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Bills', type: 'EXPENSE' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Entertainment', type: 'EXPENSE' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Others', type: 'EXPENSE' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Salary', type: 'INCOME' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Freelance', type: 'INCOME' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Business', type: 'INCOME' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Interest', type: 'INCOME' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Other Income', type: 'INCOME' },
];

async function main() {
  for (const category of SYSTEM_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        type: category.type,
        isSystem: true,
        isActive: true,
        userId: null,
        parentId: null,
      },
      create: {
        id: category.id,
        name: category.name,
        type: category.type,
        isSystem: true,
        isActive: true,
        userId: null,
      },
    });
  }

  console.log('System expense and income categories seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
