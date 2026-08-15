require('dotenv').config();
const prisma = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');
async function run() {
  const users = await prisma.user.findMany({ 
    where: { role: 'CUSTOMER', status: 'ACTIVE' }, 
    select: { email: true, password: true, name: true }, 
    take: 2 
  });
  for (const u of users) {
    // try common passwords
    for (const pwd of ['password123', 'password', 'test123', '123456', 'Password1']) {
      const ok = await bcrypt.compare(pwd, u.password);
      if (ok) {
        console.log(`FOUND: email=${u.email} password=${pwd}`);
        break;
      }
    }
  }
  await prisma.$disconnect();
}
run().catch(console.error);
