import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('admin#3771!', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@deskbird.com' },
    update: {},
    create: {
      email: 'admin@deskbird.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', { id: adminUser.id, email: adminUser.email });

  // Create some test users
  const testUsers = [
    {
      email: 'john.doe@deskbird.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER' as const,
    },
    {
      email: 'jane.smith@deskbird.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER' as const,
    },
    {
      email: 'mike.wilson@deskbird.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'USER' as const,
    },
  ];

  for (const userData of testUsers) {
    const hashedTestPassword = await bcrypt.hash('user123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedTestPassword,
        isActive: true,
      },
    });

    console.log('✅ Test user created:', { id: user.id, email: user.email });
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });