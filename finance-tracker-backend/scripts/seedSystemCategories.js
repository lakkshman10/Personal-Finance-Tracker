const prisma = require('../config/prisma');

const SYSTEM_EXPENSE_CATEGORIES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Food' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Travel' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Bills' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Entertainment' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Others' },
];

async function main() {
  for (const category of SYSTEM_EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        type: 'EXPENSE',
        isSystem: true,
        isActive: true,
        userId: null,
        parentId: null,
      },
      create: {
        id: category.id,
        name: category.name,
        type: 'EXPENSE',
        isSystem: true,
        isActive: true,
        userId: null,
      },
    });
  }

  console.log('System expense categories seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
