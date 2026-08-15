const prisma = require('./Backend/src/lib/prisma');

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'customer@example.com' }
        });
        if (user) {
            console.log('✅ User found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                hasPassword: !!user.passwordHash
            });
        } else {
            console.log('❌ User not found');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
