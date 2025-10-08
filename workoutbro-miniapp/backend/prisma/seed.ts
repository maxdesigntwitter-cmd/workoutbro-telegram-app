import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создаем программы тренировок
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        name: 'Начальная программа',
        description: 'Программа для новичков в тренажерном зале',
        difficulty: 'BEGINNER',
        duration_weeks: 8,
        workouts: {
          create: [
            {
              name: 'Тренировка A - Верх тела',
              description: 'Базовая тренировка для верхней части тела',
              exercises: {
                create: [
                  {
                    name: 'Жим штанги лежа',
                    description: 'Основное упражнение для груди',
                    muscle_groups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                    sets: 3,
                    reps: '8-12',
                    rest_seconds: 120
                  },
                  {
                    name: 'Тяга штанги в наклоне',
                    description: 'Упражнение для спины',
                    muscle_groups: ['BACK', 'BICEPS'],
                    sets: 3,
                    reps: '8-12',
                    rest_seconds: 120
                  },
                  {
                    name: 'Жим гантелей сидя',
                    description: 'Упражнение для плеч',
                    muscle_groups: ['SHOULDERS', 'TRICEPS'],
                    sets: 3,
                    reps: '10-15',
                    rest_seconds: 90
                  }
                ]
              }
            },
            {
              name: 'Тренировка B - Низ тела',
              description: 'Базовая тренировка для нижней части тела',
              exercises: {
                create: [
                  {
                    name: 'Приседания со штангой',
                    description: 'Король всех упражнений',
                    muscle_groups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
                    sets: 3,
                    reps: '8-12',
                    rest_seconds: 120
                  },
                  {
                    name: 'Становая тяга',
                    description: 'Упражнение для всей задней цепи',
                    muscle_groups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
                    sets: 3,
                    reps: '5-8',
                    rest_seconds: 180
                  },
                  {
                    name: 'Выпады с гантелями',
                    description: 'Упражнение для ног',
                    muscle_groups: ['QUADS', 'GLUTES'],
                    sets: 3,
                    reps: '10-12',
                    rest_seconds: 90
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
        name: 'Средний уровень',
        description: 'Программа для опытных атлетов',
        difficulty: 'INTERMEDIATE',
        duration_weeks: 12,
        workouts: {
          create: [
            {
              name: 'Push день',
              description: 'Тренировка толкающих мышц',
              exercises: {
                create: [
                  {
                    name: 'Жим штанги лежа',
                    description: 'Основное упражнение для груди',
                    muscle_groups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
                    sets: 4,
                    reps: '6-10',
                    rest_seconds: 150
                  },
                  {
                    name: 'Жим штанги стоя',
                    description: 'Упражнение для плеч',
                    muscle_groups: ['SHOULDERS', 'TRICEPS'],
                    sets: 4,
                    reps: '6-10',
                    rest_seconds: 120
                  },
                  {
                    name: 'Отжимания на брусьях',
                    description: 'Упражнение для груди и трицепсов',
                    muscle_groups: ['CHEST', 'TRICEPS'],
                    sets: 3,
                    reps: '8-15',
                    rest_seconds: 90
                  }
                ]
              }
            },
            {
              name: 'Pull день',
              description: 'Тренировка тянущих мышц',
              exercises: {
                create: [
                  {
                    name: 'Подтягивания',
                    description: 'Упражнение для спины',
                    muscle_groups: ['BACK', 'BICEPS'],
                    sets: 4,
                    reps: '5-12',
                    rest_seconds: 120
                  },
                  {
                    name: 'Тяга штанги в наклоне',
                    description: 'Упражнение для спины',
                    muscle_groups: ['BACK', 'BICEPS'],
                    sets: 4,
                    reps: '6-10',
                    rest_seconds: 120
                  },
                  {
                    name: 'Подъем штанги на бицепс',
                    description: 'Упражнение для бицепсов',
                    muscle_groups: ['BICEPS'],
                    sets: 3,
                    reps: '8-12',
                    rest_seconds: 90
                  }
                ]
              }
            },
            {
              name: 'Legs день',
              description: 'Тренировка ног',
              exercises: {
                create: [
                  {
                    name: 'Приседания со штангой',
                    description: 'Основное упражнение для ног',
                    muscle_groups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
                    sets: 4,
                    reps: '6-10',
                    rest_seconds: 180
                  },
                  {
                    name: 'Становая тяга',
                    description: 'Упражнение для задней цепи',
                    muscle_groups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
                    sets: 4,
                    reps: '5-8',
                    rest_seconds: 180
                  },
                  {
                    name: 'Болгарские приседания',
                    description: 'Упражнение для ног',
                    muscle_groups: ['QUADS', 'GLUTES'],
                    sets: 3,
                    reps: '10-12',
                    rest_seconds: 90
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
