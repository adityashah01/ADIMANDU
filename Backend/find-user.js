require('dotenv').config();
const prisma = require('./src/lib/prisma');
async function run() {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { email: true }, take: 3 });
  console.log(users.map(u => u.email).join('\n'));
  await prisma.$disconnect();
}
run().catch(console.error);
