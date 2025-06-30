const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminRoles() {
  try {
    // Update SUPER_ADMIN to ADMIN using raw SQL
    await prisma.$executeRaw`UPDATE "User" SET role = 'ADMIN' WHERE role = 'SUPER_ADMIN'`;

    // Update LIMITED_ADMIN to MODERATOR using raw SQL
    await prisma.$executeRaw`UPDATE "User" SET role = 'MODERATOR' WHERE role = 'LIMITED_ADMIN'`;

    console.log('Successfully updated admin roles');
  } catch (error) {
    console.error('Error updating admin roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRoles(); 