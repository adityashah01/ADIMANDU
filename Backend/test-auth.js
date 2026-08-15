const prisma = require('./src/lib/prisma').default || require('./src/lib/prisma');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  const p = prisma.prisma || prisma;
  const user = await p.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!user) return console.log('no customer');
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  console.log('Fetching auth/me with token...');
  const res = await fetch('http://localhost:4000/api/auth/me', {
    headers: { 'Cookie': `token=${token}` }
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
  process.exit(0);
}
run();
