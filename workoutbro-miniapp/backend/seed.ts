import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample programs
  const program1 = await prisma.program.create({
    data: {
      title: 'The Bodybuilding Transformation System',
      description: 'Комплексная программа для набора мышечной массы с фокусом на основные группы мышц',
      goal: 'Набор мышечной массы',
      duration_days: 84,
      image_url: 'https://example.com/bodybuilding.jpg'
    }
  });

  const program2 = await prisma.program.create({
    data: {
      title: 'Bigger Arms Program',
      description: 'Специализированная программа для развития мышц рук',
      goal: 'Развитие мышц рук',
      duration_days: 28,
      image_url: 'https://example.com/arms.jpg'
    }
  });

  // Create workouts for program 1
  const workout1 = await prisma.workout.create({
    data: {
      program_id: program1.id,
      day_name: 'Понедельник',
      order_index: 1
    }
  });

  const workout2 = await prisma.workout.create({
    data: {
      program_id: program1.id,
      day_name: 'Среда',
      order_index: 2
    }
  });

  // Create exercises for workout 1 (Back day)
  await prisma.exercise.create({
    data: {
      workout_id: workout1.id,
      name: 'Подтягивания широким хватом',
      sets: 4,
      reps: 8,
      weight: 0,
      rest_time: 120,
      muscle_group: 'Спина',
      order_index: 1
    }
  });

  await prisma.exercise.create({
    data: {
      workout_id: workout1.id,
      name: 'Тяга штанги в наклоне',
      sets: 4,
      reps: 10,
      weight: 60,
      rest_time: 90,
      muscle_group: 'Спина',
      order_index: 2
    }
  });

  // Create exercises for workout 2 (Chest day)
  await prisma.exercise.create({
    data: {
      workout_id: workout2.id,
      name: 'Жим штанги лежа',
      sets: 4,
      reps: 8,
      weight: 80,
      rest_time: 120,
      muscle_group: 'Грудь',
      order_index: 1
    }
  });

  await prisma.exercise.create({
    data: {
      workout_id: workout2.id,
      name: 'Жим гантелей на наклонной скамье',
      sets: 4,
      reps: 10,
      weight: 30,
      rest_time: 90,
      muscle_group: 'Грудь',
      order_index: 2
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${await prisma.program.count()} programs`);
  console.log(`🏋️ Created ${await prisma.workout.count()} workouts`);
  console.log(`💪 Created ${await prisma.exercise.count()} exercises`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });