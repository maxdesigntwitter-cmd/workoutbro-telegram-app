const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создаем одну программу тренировок для тестирования
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        title: 'Базовая программа',
        description: 'Универсальная программа для всех уровней',
        goal: 'Развитие силы и выносливости',
        duration_days: 28, // 4 недели
        workouts: {
          create: [
            {
              day_name: 'День 1 - Верх тела',
              order_index: 1,
              exercises: {
                create: [
                  {
                    name: 'Жим штанги лежа',
                    sets: 3,
                    reps: 10,
                    weight: 60,
                    rest_time: 120,
                    muscle_group: 'Грудь',
                    order_index: 1
                  },
                  {
                    name: 'Тяга штанги в наклоне',
                    sets: 3,
                    reps: 10,
                    weight: 50,
                    rest_time: 120,
                    muscle_group: 'Спина',
                    order_index: 2
                  },
                  {
                    name: 'Жим гантелей сидя',
                    sets: 3,
                    reps: 12,
                    weight: 20,
                    rest_time: 90,
                    muscle_group: 'Плечи',
                    order_index: 3
                  }
                ]
              }
            },
            {
              day_name: 'День 2 - Низ тела',
              order_index: 2,
              exercises: {
                create: [
                  {
                    name: 'Приседания со штангой',
                    sets: 3,
                    reps: 10,
                    weight: 80,
                    rest_time: 120,
                    muscle_group: 'Ноги',
                    order_index: 1
                  },
                  {
                    name: 'Становая тяга',
                    sets: 3,
                    reps: 6,
                    weight: 90,
                    rest_time: 180,
                    muscle_group: 'Спина',
                    order_index: 2
                  },
                  {
                    name: 'Выпады с гантелями',
                    sets: 3,
                    reps: 12,
                    weight: 15,
                    rest_time: 90,
                    muscle_group: 'Ноги',
                    order_index: 3
                  }
                ]
              }
            },
            {
              day_name: 'День 3 - Полное тело',
              order_index: 3,
              exercises: {
                create: [
                  {
                    name: 'Подтягивания',
                    sets: 3,
                    reps: 8,
                    weight: 0,
                    rest_time: 120,
                    muscle_group: 'Спина',
                    order_index: 1
                  },
                  {
                    name: 'Отжимания',
                    sets: 3,
                    reps: 15,
                    weight: 0,
                    rest_time: 90,
                    muscle_group: 'Грудь',
                    order_index: 2
                  },
                  {
                    name: 'Планка',
                    sets: 3,
                    reps: 30,
                    weight: 0,
                    rest_time: 60,
                    muscle_group: 'Пресс',
                    order_index: 3
                  }
                ]
              }
            }
          ]
        }
      }
    })
  ]);

  console.log(`✅ Created ${programs.length} programs`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
