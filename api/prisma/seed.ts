import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Owner user
  const ownerPin = await bcrypt.hash('123456', 10);
  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      pin_hash: ownerPin,
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log('✅ Owner user created:', owner.username, '(PIN: 123456)');

  // Create Admin user if not exists
  const adminPin = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      pin_hash: adminPin,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.username, '(PIN: 123456)');

  // Create sample services if none exist
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: 'Cuci Kiloan',
          price: 7000,
          unitType: 'KG',
          defaultDuration: 60,
          isActive: true,
        },
        {
          name: 'Cuci Satuan',
          price: 15000,
          unitType: 'PCS',
          defaultDuration: 45,
          isActive: true,
        },
        {
          name: 'Cuci Express',
          price: 12000,
          unitType: 'KG',
          defaultDuration: 30,
          isActive: true,
        },
        {
          name: 'Setrika',
          price: 5000,
          unitType: 'KG',
          defaultDuration: 30,
          isActive: true,
        },
        {
          name: 'Dry Cleaning',
          price: 25000,
          unitType: 'PCS',
          defaultDuration: 120,
          isActive: true,
        },
      ],
    });
    console.log('✅ Sample services created');
  }

  // Create sample machines if none exist
  const machineCount = await prisma.machine.count();
  if (machineCount === 0) {
    await prisma.machine.createMany({
      data: [
        { name: 'Mesin 1', status: 'IDLE' },
        { name: 'Mesin 2', status: 'IDLE' },
        { name: 'Mesin 3', status: 'IDLE' },
        { name: 'Mesin 4', status: 'IDLE' },
      ],
    });
    console.log('✅ Sample machines created');
  }

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
