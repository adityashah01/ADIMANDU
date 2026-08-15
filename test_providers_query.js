const prisma = require('./Backend/src/lib/prisma');

async function test() {
    try {
        const providers = await prisma.providerProfile.findMany({
            where: { verified: true },
            include: {
                user: { select: { name: true, avatarUrl: true, phone: true } },
                category: { select: { name: true, id: true, slug: true } },
            }
        });
        console.log('Success:', providers.length, 'providers found');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
