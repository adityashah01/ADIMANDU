const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

const newCategories = [
    { name: 'Pest Control', slug: 'pest-control', description: 'Eco-friendly pest control, bed bugs, termites, and sanitization services' },
    { name: 'Home Salon & Beauty', slug: 'beautician', description: 'Professional beauticians for salon, facial, hair styling, and makeup at home' },
    { name: 'Packers & Movers', slug: 'packers-movers', description: 'Worry-free local room shifting, office relocation, and wrapping experts' },
    { name: 'Gardening & Landscaping', slug: 'gardening', description: 'Experienced gardeners for lawn care, plant trimming, and garden layout design' },
    { name: 'Home Nursing & Care', slug: 'home-nursing', description: 'Compassionate elderly care, post-op nursing, and physiotherapy at home' },
    { name: 'Computer & IT Support', slug: 'it-support', description: 'Expert laptop/PC repair, Wi-Fi diagnosis, OS installations, and CCTV setup' },
    { name: 'Solar & Inverter Service', slug: 'solar-inverter', description: 'Solar water heater maintenance, inverter battery replacement, and wiring' }
];

const newCatalogServices = [
    // Pest Control
    { categorySlug: 'pest-control', name: 'General Pest Control', slug: 'general-pest-control', serviceType: 'FIXED_PRICE', basePrice: 2000 },
    { categorySlug: 'pest-control', name: 'Bed Bug Treatment', slug: 'bed-bug-treatment', serviceType: 'INSPECTION_BASED', inspectionFee: 400 },
    { categorySlug: 'pest-control', name: 'Termite Extermination', slug: 'termite-extermination', serviceType: 'INSPECTION_BASED', inspectionFee: 500 },
    { categorySlug: 'pest-control', name: 'Cockroach & Rodent Control', slug: 'cockroach-rodent-control', serviceType: 'FIXED_PRICE', basePrice: 1500 },

    // Home Salon & Beauty
    { categorySlug: 'beautician', name: 'Home Facial & Clean-up', slug: 'home-facial', serviceType: 'FIXED_PRICE', basePrice: 1200 },
    { categorySlug: 'beautician', name: 'Party Makeup & Hair Styling', slug: 'party-makeup', serviceType: 'FIXED_PRICE', basePrice: 2500 },
    { categorySlug: 'beautician', name: 'Pedicure & Manicure Session', slug: 'pedicure-manicure', serviceType: 'FIXED_PRICE', basePrice: 1000 },
    { categorySlug: 'beautician', name: 'Full Body Waxing & Threading', slug: 'body-waxing', serviceType: 'FIXED_PRICE', basePrice: 1800 },

    // Packers & Movers
    { categorySlug: 'packers-movers', name: 'Local Room Shifting (1 BHK)', slug: 'local-room-shifting', serviceType: 'INSPECTION_BASED', inspectionFee: 500 },
    { categorySlug: 'packers-movers', name: 'Office Relocation Service', slug: 'office-relocation', serviceType: 'INSPECTION_BASED', inspectionFee: 1000 },
    { categorySlug: 'packers-movers', name: 'Packing & Wrapping Only', slug: 'packing-wrapping', serviceType: 'FIXED_PRICE', basePrice: 3500 },

    // Gardening
    { categorySlug: 'gardening', name: 'Garden Maintenance Visit', slug: 'garden-maintenance', serviceType: 'FIXED_PRICE', basePrice: 800 },
    { categorySlug: 'gardening', name: 'Lawn Mowing & Weed Removal', slug: 'lawn-mowing', serviceType: 'FIXED_PRICE', basePrice: 1200 },
    { categorySlug: 'gardening', name: 'Tree Pruning & Soil Treatment', slug: 'tree-pruning', serviceType: 'INSPECTION_BASED', inspectionFee: 300 },

    // Home Nursing
    { categorySlug: 'home-nursing', name: 'Elderly Care Assistance (Daily)', slug: 'elderly-care-daily', serviceType: 'FIXED_PRICE', basePrice: 1500 },
    { categorySlug: 'home-nursing', name: 'Post-Operative Nursing (Daily)', slug: 'post-op-nursing', serviceType: 'INSPECTION_BASED', inspectionFee: 600 },
    { categorySlug: 'home-nursing', name: 'Home Physiotherapy Session', slug: 'home-physiotherapy', serviceType: 'FIXED_PRICE', basePrice: 1000 },

    // Computer & IT
    { categorySlug: 'it-support', name: 'Laptop/Desktop Repair', slug: 'laptop-repair', serviceType: 'INSPECTION_BASED', inspectionFee: 300 },
    { categorySlug: 'it-support', name: 'Wi-Fi & Router Diagnosis', slug: 'wifi-diagnosis', serviceType: 'FIXED_PRICE', basePrice: 500 },
    { categorySlug: 'it-support', name: 'CCTV Camera Installation', slug: 'cctv-installation', serviceType: 'INSPECTION_BASED', inspectionFee: 400 },
    { categorySlug: 'it-support', name: 'OS & Software Installation', slug: 'os-installation', serviceType: 'FIXED_PRICE', basePrice: 800 },

    // Solar & Inverter
    { categorySlug: 'solar-inverter', name: 'Solar Water Heater Repair', slug: 'solar-heater-repair', serviceType: 'INSPECTION_BASED', inspectionFee: 400 },
    { categorySlug: 'solar-inverter', name: 'Inverter Battery Replacement', slug: 'inverter-battery-replace', serviceType: 'FIXED_PRICE', basePrice: 1000 },
    { categorySlug: 'solar-inverter', name: 'Backup Power Maintenance', slug: 'backup-power-maintenance', serviceType: 'INSPECTION_BASED', inspectionFee: 300 }
];

const newProviders = [
    {
        name: 'Sushil Thapa',
        email: 'sushil.pest@adimandu.np',
        phone: '+977-9841234050',
        categorySlug: 'pest-control',
        businessName: 'Adimandu Pest & Bug Terminators',
        bio: 'Professional eco-friendly pest control and bed bug eradication specialist with safety certifications.',
        location: 'Lazimpat, Kathmandu',
        latitude: 27.7225,
        longitude: 85.3190,
        serviceArea: 'Kathmandu, Lalitpur, Bhaktapur',
        skills: ['General Pest Control', 'Bed Bug Treatment', 'Termite Treatment', 'Rodent Extermination'],
        experience: '8 years',
        price: 1500,
        averageRating: 4.8,
        reviewCount: 22,
        jobsCompleted: 94,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Anjali Shrestha',
        email: 'anjali.beauty@adimandu.np',
        phone: '+977-9841234051',
        categorySlug: 'beautician',
        businessName: 'Anjali Bridal & Home Salon Care',
        bio: 'Licensed beautician and bridal cosmetologist delivering premium salon care, waxing, and facials at your doorstep.',
        location: 'Sanepa, Lalitpur',
        latitude: 27.6830,
        longitude: 85.3080,
        serviceArea: 'Sanepa, Jhamsikhel, Pulchowk, Bakhundole',
        skills: ['Home Facial', 'Party Makeup', 'Pedicure & Manicure', 'Body Waxing'],
        experience: '6 years',
        price: 1200,
        averageRating: 4.9,
        reviewCount: 38,
        jobsCompleted: 124,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Prakash Pandey',
        email: 'prakash.movers@adimandu.np',
        phone: '+977-9841234052',
        categorySlug: 'packers-movers',
        businessName: 'Adimandu Swift Packers & Shifters',
        bio: 'Safe and professional room shifting, packing, and office cargo handlers with robust safety insurance across Kathmandu Valley.',
        location: 'Koteshwor, Kathmandu',
        latitude: 27.6750,
        longitude: 85.3470,
        serviceArea: 'Kathmandu, Lalitpur, Bhaktapur, Banepa',
        skills: ['Local Room Shifting', 'Office Relocation', 'Packing & Wrapping'],
        experience: '10 years',
        price: 3500,
        averageRating: 4.7,
        reviewCount: 45,
        jobsCompleted: 210,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Hari Lal Shrestha',
        email: 'harilal.garden@adimandu.np',
        phone: '+977-9841234053',
        categorySlug: 'gardening',
        businessName: 'Valley Green Gardening Services',
        bio: 'Experienced plant therapist and landscaper helping you cultivate beautiful lawns, healthy soil, and plant designs.',
        location: 'Budhanilkantha, Kathmandu',
        latitude: 27.7780,
        longitude: 85.3620,
        serviceArea: 'Budhanilkantha, Maharajgunj, Baluwatar, Chabahil',
        skills: ['Garden Maintenance', 'Lawn Mowing', 'Tree Pruning', 'Soil Enrichment'],
        experience: '12 years',
        price: 800,
        averageRating: 4.9,
        reviewCount: 19,
        jobsCompleted: 78,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Dr. Kabita Giri',
        email: 'kabita.care@adimandu.np',
        phone: '+977-9841234054',
        categorySlug: 'home-nursing',
        businessName: 'Adimandu Compassionate Home Nursing',
        bio: 'Senior nurse offering critical home care, physiotherapy sessions, elderly care assistance, and baby care.',
        location: 'Jawalakhel, Lalitpur',
        latitude: 27.6745,
        longitude: 85.3165,
        serviceArea: 'Jawalakhel, Pulchowk, Kupandole, Kumaripati',
        skills: ['Elderly Care', 'Post-Op Nursing', 'Physiotherapy', 'Baby Care'],
        experience: '15 years',
        price: 1500,
        averageRating: 4.9,
        reviewCount: 52,
        jobsCompleted: 195,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Manish Bajracharya',
        email: 'manish.it@adimandu.np',
        phone: '+977-9841234055',
        categorySlug: 'it-support',
        businessName: 'KTM TechForce & IT Support',
        bio: 'Hardware/software engineer repairing laptops, designing Wi-Fi meshes, setting up CCTVs, and cleaning systems.',
        location: 'Baneshwor, Kathmandu',
        latitude: 27.6930,
        longitude: 85.3410,
        serviceArea: 'Baneshwor, Maitighar, Koteshwor, Sinamangal',
        skills: ['Laptop Repair', 'Wi-Fi Diagnosis', 'CCTV Setup', 'OS Installation'],
        experience: '7 years',
        price: 800,
        averageRating: 4.8,
        reviewCount: 31,
        jobsCompleted: 110,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    {
        name: 'Subash Bhatta',
        email: 'subash.solar@adimandu.np',
        phone: '+977-9841234056',
        categorySlug: 'solar-inverter',
        businessName: 'Kathmandu Solar & Battery Solutions',
        bio: 'Technician specialized in rooftop solar panels, backup inverters, battery replacements, and hot water systems.',
        location: 'Chabahil, Kathmandu',
        latitude: 27.7180,
        longitude: 85.3530,
        serviceArea: 'Chabahil, Boudha, Kapan, Jorpati',
        skills: ['Solar Heater Repair', 'Inverter Battery replace', 'Backup Power Maintenance'],
        experience: '9 years',
        price: 1000,
        averageRating: 4.6,
        reviewCount: 14,
        jobsCompleted: 62,
        verified: true,
        isAvailable: true,
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
    }
];

async function main() {
    console.log('🚀 Seeding 7 brand new service categories...');
    const categoryMap = {};

    for (const cat of newCategories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description },
            create: { name: cat.name, slug: cat.slug, description: cat.description },
        });
        categoryMap[cat.slug] = created;
        console.log(`- Category Upserted: ${cat.name}`);
    }

    console.log('\n🚀 Seeding new Catalog Services...');
    for (const cs of newCatalogServices) {
        const cat = categoryMap[cs.categorySlug];
        if (!cat) {
            console.warn(`Category slug '${cs.categorySlug}' not found.`);
            continue;
        }

        await prisma.catalogService.upsert({
            where: { slug: cs.slug },
            update: {
                name: cs.name,
                serviceType: cs.serviceType,
                basePrice: cs.basePrice || null,
                inspectionFee: cs.inspectionFee || null,
            },
            create: {
                categoryId: cat.id,
                name: cs.name,
                slug: cs.slug,
                serviceType: cs.serviceType,
                basePrice: cs.basePrice || null,
                inspectionFee: cs.inspectionFee || null,
            },
        });
        console.log(`- Catalog Service: ${cs.name}`);
    }

    console.log('\n🚀 Seeding 7 professional Adimandu Providers...');
    const passwordHash = await bcrypt.hash('password123', 10);

    for (const p of newProviders) {
        const cat = categoryMap[p.categorySlug];
        if (!cat) continue;

        // 1. Create User
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {
                name: p.name,
                phone: p.phone,
                role: 'PROVIDER',
                avatarUrl: p.avatarUrl,
                latitude: p.latitude,
                longitude: p.longitude,
            },
            create: {
                name: p.name,
                email: p.email,
                passwordHash,
                phone: p.phone,
                role: 'PROVIDER',
                avatarUrl: p.avatarUrl,
                latitude: p.latitude,
                longitude: p.longitude,
            }
        });

        // 2. Create ProviderProfile
        const profile = await prisma.providerProfile.upsert({
            where: { userId: user.id },
            update: {
                categoryId: cat.id,
                businessName: p.businessName,
                bio: p.bio,
                location: p.location,
                latitude: p.latitude,
                longitude: p.longitude,
                serviceArea: p.serviceArea,
                skills: p.skills,
                experience: p.experience,
                price: p.price,
                verified: p.verified,
                isAvailable: p.isAvailable,
                averageRating: p.averageRating,
                reviewCount: p.reviewCount,
                jobsCompleted: p.jobsCompleted,
            },
            create: {
                userId: user.id,
                categoryId: cat.id,
                businessName: p.businessName,
                bio: p.bio,
                location: p.location,
                latitude: p.latitude,
                longitude: p.longitude,
                serviceArea: p.serviceArea,
                skills: p.skills,
                experience: p.experience,
                price: p.price,
                verified: p.verified,
                isAvailable: p.isAvailable,
                averageRating: p.averageRating,
                reviewCount: p.reviewCount,
                jobsCompleted: p.jobsCompleted,
            }
        });

        // 3. Link CatalogServices
        const catalogServices = await prisma.catalogService.findMany({
            where: { categoryId: cat.id }
        });

        for (const cs of catalogServices) {
            const existing = await prisma.providerService.findFirst({
                where: {
                    providerId: profile.id,
                    catalogServiceId: cs.id,
                }
            });

            if (!existing) {
                await prisma.providerService.create({
                    data: {
                        providerId: profile.id,
                        catalogServiceId: cs.id,
                        customPrice: p.price,
                        isActive: true
                    }
                });
            }
        }
        console.log(`- Created/Updated provider profile: ${p.name}`);
    }

    console.log('\n🎉 Successfully finished seeding expanded Adimandu services & providers!');
}

main()
    .catch((err) => {
        console.error('Error seeding expanded services:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
