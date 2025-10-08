const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создаем программы тренировок
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        title: 'Начальная программа',
        description: 'Программа для новичков в тренажерном зале',
        goal: 'Набор мышечной массы и силы',
        duration_days: 56, // 8 недель
        workouts: {
          create: [
            {
              day_name: 'Тренировка A - Верх тела',
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
              day_name: 'Тренировка B - Низ тела',
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
            }
          ]
        }
      }
    }),
    prisma.program.create({
      data: {
        title: 'Средний уровень',
        description: 'Программа для опытных атлетов',
        goal: 'Увеличение силы и массы',
        duration_days: 84, // 12 недель
        workouts: {
          create: [
            {
              day_name: 'Push день',
              order_index: 1,
              exercises: {
                create: [
                  {
                    name: 'Жим штанги лежа',
                    sets: 4,
                    reps: 8,
                    weight: 80,
                    rest_time: 150,
                    muscle_group: 'Грудь',
                    order_index: 1
                  },
                  {
                    name: 'Жим штанги стоя',
                    sets: 4,
                    reps: 8,
                    weight: 40,
                    rest_time: 120,
                    muscle_group: 'Плечи',
                    order_index: 2
                  },
                  {
                    name: 'Отжимания на брусьях',
                    sets: 3,
                    reps: 12,
                    weight: 0,
                    rest_time: 90,
                    muscle_group: 'Грудь',
                    order_index: 3
                  }
                ]
              }
            },
            {
              day_name: 'Pull день',
              order_index: 2,
              exercises: {
                create: [
                  {
                    name: 'Подтягивания',
                    sets: 4,
                    reps: 8,
                    weight: 0,
                    rest_time: 120,
                    muscle_group: 'Спина',
                    order_index: 1
                  },
                  {
                    name: 'Тяга штанги в наклоне',
                    sets: 4,
                    reps: 8,
                    weight: 70,
                    rest_time: 120,
                    muscle_group: 'Спина',
                    order_index: 2
                  },
                  {
                    name: 'Подъем штанги на бицепс',
                    sets: 3,
                    reps: 10,
                    weight: 30,
                    rest_time: 90,
                    muscle_group: 'Бицепс',
                    order_index: 3
                  }
                ]
              }
            },
            {
              day_name: 'Legs день',
              order_index: 3,
              exercises: {
                create: [
                  {
                    name: 'Приседания со штангой',
                    sets: 4,
                    reps: 8,
                    weight: 100,
                    rest_time: 180,
                    muscle_group: 'Ноги',
                    order_index: 1
                  },
                  {
                    name: 'Становая тяга',
                    sets: 4,
                    reps: 6,
                    weight: 110,
                    rest_time: 180,
                    muscle_group: 'Спина',
                    order_index: 2
                  },
                  {
                    name: 'Болгарские приседания',
                    sets: 3,
                    reps: 12,
                    weight: 20,
                    rest_time: 90,
                    muscle_group: 'Ноги',
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
