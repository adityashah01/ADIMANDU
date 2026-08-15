const prisma = require('./Backend/src/lib/prisma');

async function seedProviders() {
    try {
        // 1. Create a user
        const user = await prisma.user.upsert({
            where: { email: 'provider1@example.com' },
            update: {},
            create: {
                email: 'provider1@example.com',
                passwordHash: 'password123',
                name: 'Ram Bahadur',
                role: 'PROVIDER',
            }
        });

        // 2. Get a category
        const category = await prisma.category.findFirst({
            where: { slug: 'plumbing' }
        });

        if (!category) {
            console.error('Category not found. Run seed.js first.');
            return;
        }

        // 3. Create a provider profile
        await prisma.providerProfile.upsert({
            where: { userId: user.id },
            update: { verified: true },
            create: {
                userId: user.id,
                categoryId: category.id,
                location: 'Kathmandu',
                bio: 'Professional plumber with 10 years experience.',
                skills: ['Pipe Repair', 'Drain Cleaning'],
                experience: '10 years',
                verified: true,
                price: 500.00,
                averageRating: 4.8,
                reviewCount: 15,
            }
        });

        console.log('✅ Sample provider seeded');
    } catch (err) {
        console.error('Error seeding providers:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedProviders();
