import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.userMaterial.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.inviteLink.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();

  // Create materials
  const materials = [
    // Programs
    {
      title: '21-дневная база',
      description: 'Программа для новичков с основами силовых тренировок',
      category: 'PROGRAMS',
      level: 'BASE',
      url: 'https://docs.google.com/document/d/example1',
    },
    {
      title: 'Программа для дома',
      description: 'Тренировки без оборудования',
      category: 'PROGRAMS',
      level: 'BASE',
      url: 'https://docs.google.com/document/d/example2',
    },
    {
      title: 'Продвинутая программа',
      description: 'Для опытных спортсменов',
      category: 'PROGRAMS',
      level: 'BRO',
      url: 'https://docs.google.com/document/d/example3',
    },
    {
      title: 'Персональная программа',
      description: 'Индивидуальный план тренировок',
      category: 'PROGRAMS',
      level: 'PRO',
      url: 'https://docs.google.com/document/d/example4',
    },

    // Recovery
    {
      title: 'Растяжка после тренировки',
      description: 'Комплекс упражнений на растяжку',
      category: 'RECOVERY',
      level: 'BASE',
      url: 'https://youtube.com/playlist/example1',
    },
    {
      title: 'Массаж и самомассаж',
      description: 'Техники восстановления мышц',
      category: 'RECOVERY',
      level: 'BRO',
      url: 'https://youtube.com/playlist/example2',
    },
    {
      title: 'Персональное восстановление',
      description: 'Индивидуальный план восстановления',
      category: 'RECOVERY',
      level: 'PRO',
      url: 'https://youtube.com/playlist/example3',
    },

    // Nutrition
    {
      title: 'Основы питания',
      description: 'Базовые принципы правильного питания',
      category: 'NUTRITION',
      level: 'BASE',
      url: 'https://docs.google.com/document/d/nutrition1',
    },
    {
      title: 'Питание для набора массы',
      description: 'Рацион для роста мышц',
      category: 'NUTRITION',
      level: 'BRO',
      url: 'https://docs.google.com/document/d/nutrition2',
    },
    {
      title: 'Персональное питание',
      description: 'Индивидуальный план питания',
      category: 'NUTRITION',
      level: 'PRO',
      url: 'https://docs.google.com/document/d/nutrition3',
    },

    // FAQ
    {
      title: 'Часто задаваемые вопросы',
      description: 'Ответы на популярные вопросы',
      category: 'FAQ',
      level: 'FREE',
      url: 'https://docs.google.com/document/d/faq1',
    },
    {
      title: 'Техника выполнения упражнений',
      description: 'Правильная техника базовых упражнений',
      category: 'TECHNIQUE',
      level: 'BASE',
      url: 'https://youtube.com/playlist/technique1',
    },
  ];

  for (const material of materials) {
    await prisma.material.create({
      data: material,
    });
  }

  // Create test users
  const testUsers = [
    {
      telegramId: BigInt(123456789),
      username: 'test_user_free',
      firstName: 'Test',
      lastName: 'User',
      level: 'FREE',
    },
    {
      telegramId: BigInt(987654321),
      username: 'test_user_base',
      firstName: 'Base',
      lastName: 'User',
      level: 'BASE',
      since: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      telegramId: BigInt(555666777),
      username: 'test_user_bro',
      firstName: 'Bro',
      lastName: 'User',
      level: 'BRO',
      since: new Date(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    },
  ];

  for (const user of testUsers) {
    await prisma.user.create({
      data: user,
    });
  }

  // Create test invite links
  const inviteLinks = [
    {
      link: 'test_base_invite',
      level: 'BASE',
      maxUses: 1,
    },
    {
      link: 'test_bro_invite',
      level: 'BRO',
      maxUses: 1,
    },
    {
      link: 'test_pro_invite',
      level: 'PRO',
      maxUses: 1,
    },
  ];

  for (const inviteLink of inviteLinks) {
    await prisma.inviteLink.create({
      data: inviteLink,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📚 Created ${materials.length} materials`);
  console.log(`👥 Created ${testUsers.length} test users`);
  console.log(`🔗 Created ${inviteLinks.length} invite links`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });