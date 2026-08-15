const prisma = require('./Backend/src/lib/prisma');
const bcrypt = require('bcryptjs');

async function testLogin() {
    const email = 'customer@example.com';
    const password = 'password123';
    
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            console.log('User not found');
            return;
        }
        
        const valid = await bcrypt.compare(password, user.passwordHash);
        console.log('Login Test Result:', valid ? 'SUCCESS' : 'FAILED');
        
        if (!valid) {
            console.log('Stored Hash:', user.passwordHash);
            const freshHash = await bcrypt.hash(password, 10);
            console.log('Fresh Hash for password123:', freshHash);
            const freshValid = await bcrypt.compare(password, freshHash);
            console.log('Fresh Hash Valid:', freshValid);
        }
    } catch (error) {
        console.error('Error testing login:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
