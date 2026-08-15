const prisma = require('../src/lib/prisma');

async function main() {
    console.log('--- Seeding Coordinates Starting ---');

    // Kathmandu Center (approx)
    const ktmCenter = { lat: 27.7172, lng: 85.3240 };

    // Update Customer
    const customer = await prisma.user.update({
        where: { email: 'customer@example.com' },
        data: {
            latitude: 27.7100,
            longitude: 85.3100
        }
    });
    console.log('✅ Customer coordinates updated');

    // Update Provider 1 (Ram Bahadur)
    const providerUser = await prisma.user.findUnique({
        where: { email: 'provider1@example.com' }
    });

    if (providerUser) {
        await prisma.providerProfile.update({
            where: { userId: providerUser.id },
            data: {
                latitude: 27.7000,
                longitude: 85.3000,
                location: 'Kalimati, Kathmandu'
            }
        });
        console.log('✅ Provider 1 coordinates updated');
    }

    // Create another provider for testing distance ranking
    const provider2Email = 'provider2@example.com';
    const provider2User = await prisma.user.upsert({
        where: { email: provider2Email },
        update: {},
        create: {
            email: provider2Email,
            passwordHash: 'dummy',
            name: 'Shyam Electrician',
            role: 'PROVIDER',
            status: 'ACTIVE'
        }
    });

    const electricalCat = await prisma.category.findUnique({ where: { slug: 'electrical' } });
    if (electricalCat) {
        await prisma.providerProfile.upsert({
            where: { userId: provider2User.id },
            update: {
                latitude: 27.8000, // Further away
                longitude: 85.4000,
                verified: true
            },
            create: {
                userId: provider2User.id,
                categoryId: electricalCat.id,
                location: 'Bhaktapur',
                latitude: 27.8000,
                longitude: 85.4000,
                price: 600,
                verified: true,
                averageRating: 4.5,
                reviewCount: 5
            }
        });
        console.log('✅ Provider 2 seeded (further away)');
    }

    console.log('--- Seeding Coordinates Completed ---');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
