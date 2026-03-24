const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email })));

  const accounts = await prisma.account.findMany();
  console.log("Accounts:", accounts.map(a => ({ 
    id: a.id, 
    userId: a.userId, 
    provider: a.provider, 
    hasAccessToken: !!a.access_token 
  })));
  
  // also check if any calendar events exist by calling the actual code?
  
  await prisma.$disconnect();
}

check().catch(console.error);
