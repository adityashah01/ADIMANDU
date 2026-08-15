const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

const categories = [
    { name: 'Plumbing',         slug: 'plumbing',         description: 'Professional plumbing and pipe repair services' },
    { name: 'Electrical',       slug: 'electrical',       description: 'Professional electrical installation and repair services' },
    { name: 'Cleaning',         slug: 'cleaning',         description: 'Home and office cleaning services' },
    { name: 'Tutoring',         slug: 'tutoring',         description: 'Professional tutoring and educational services' },
    { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Repair and maintenance of household appliances' },
    { name: 'Carpentry',        slug: 'carpentry',        description: 'Furniture, woodwork, and carpentry services' },
    { name: 'Painting',         slug: 'painting',         description: 'Interior and exterior painting services' },
    { name: 'Vehicle Mechanic', slug: 'vehicle-mechanic', description: 'Vehicle repair and mechanical services' },
];

const catalogServices = [
    { categorySlug: 'plumbing', name: 'Pipe Leak Repair',           slug: 'pipe-leak-repair',           serviceType: 'INSPECTION_BASED', inspectionFee: 200 },
    { categorySlug: 'plumbing', name: 'Drain Cleaning',             slug: 'drain-cleaning',             serviceType: 'FIXED_PRICE',      basePrice: 800 },
    { categorySlug: 'plumbing', name: 'Tap Replacement',            slug: 'tap-replacement',            serviceType: 'FIXED_PRICE',      basePrice: 600 },
    { categorySlug: 'electrical', name: 'Fan Installation',         slug: 'fan-installation',           serviceType: 'FIXED_PRICE',      basePrice: 500 },
    { categorySlug: 'cleaning', name: 'Standard Home Cleaning',     slug: 'standard-home-cleaning',     serviceType: 'FIXED_PRICE',      basePrice: 1500 },
];

async function main() {
    console.log('--- Custom Seeding Starting ---');

    // 1. Seed categories
    const categoryMap = {};
    for (const cat of categories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description },
            create: { name: cat.name, slug: cat.slug, description: cat.description },
        });
        categoryMap[cat.slug] = created.id;
    }
    console.log('✅ Categories seeded');

    // 2. Seed catalog services
    for (const svc of catalogServices) {
        const categoryId = categoryMap[svc.categorySlug];
        if (categoryId) {
            await prisma.catalogService.upsert({
                where: { slug: svc.slug },
                update: {
                    name: svc.name,
                    serviceType: svc.serviceType,
                    basePrice: svc.basePrice ?? null,
                    inspectionFee: svc.inspectionFee ?? null,
                },
                create: {
                    categoryId,
                    name: svc.name,
                    slug: svc.slug,
                    serviceType: svc.serviceType,
                    basePrice: svc.basePrice ?? null,
                    inspectionFee: svc.inspectionFee ?? null,
                },
            });
        }
    }
    console.log('✅ Catalog services seeded');

    // 3. Create Customer User (as requested)
    const customerEmail = 'customer@example.com';
    const customerPassword = 'password123';
    const customerPasswordHash = await bcrypt.hash(customerPassword, 10);

    const customer = await prisma.user.upsert({
        where: { email: customerEmail },
        update: { passwordHash: customerPasswordHash },
        create: {
            email: customerEmail,
            passwordHash: customerPasswordHash,
            name: 'John Customer',
            role: 'CUSTOMER',
        }
    });
    console.log(`✅ Customer seeded: ${customerEmail} / ${customerPassword}`);

    // 4. Create Provider User
    const providerEmail = 'provider1@example.com';
    const providerPasswordHash = await bcrypt.hash('password123', 10);

    const providerUser = await prisma.user.upsert({
        where: { email: providerEmail },
        update: { passwordHash: providerPasswordHash },
        create: {
            email: providerEmail,
            passwordHash: providerPasswordHash,
            name: 'Ram Bahadur',
            role: 'PROVIDER',
        }
    });

    // 5. Provider Profile
    const plumbingId = categoryMap['plumbing'];
    if (plumbingId) {
        await prisma.providerProfile.upsert({
            where: { userId: providerUser.id },
            update: { verified: true },
            create: {
                userId: providerUser.id,
                categoryId: plumbingId,
                location: 'Kathmandu',
                bio: 'Professional plumber with 10 years experience.',
                skills: ['Pipe Repair', 'Drain Cleaning'],
                experience: '10 years',
                verified: true,
                price: 500,
                averageRating: 4.8,
                reviewCount: 15,
            }
        });
        console.log('✅ Provider profile seeded');
    }

    console.log('--- Custom Seeding Completed ---');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
