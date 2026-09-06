const prisma = require('../config/prisma');

const SYSTEM_EXPENSE_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Others'];

async function main() {
  for (const name of SYSTEM_EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        id: `00000000-0000-0000-0000-${String(SYSTEM_EXPENSE_CATEGORIES.indexOf(name) + 1).padStart(12, '0')}`,
      },
      update: { name, type: 'EXPENSE', isSystem: true, isActive: true, userId: null },
      create: {
        id: `00000000-0000-0000-0000-${String(SYSTEM_EXPENSE_CATEGORIES.indexOf(name) + 1).padStart(12, '0')}`,
        name,
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
