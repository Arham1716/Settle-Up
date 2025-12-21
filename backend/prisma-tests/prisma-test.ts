import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'testuser1@example.com',
      password: 'hashed-password', // can be plain for test
    },
  });

  // Create a group
  const group = await prisma.group.create({
    data: {
      name: 'Test Group',
      description: 'Testing groups',
      createdById: user.id,
    },
  });

  // Add a member
  const member = await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: group.id,
      role: 'ADMIN',
    },
  });

  console.log('Created user:', user);
  console.log('Created group:', group);
  console.log('Created group member:', member);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
