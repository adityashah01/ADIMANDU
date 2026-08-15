const prisma = require('../src/lib/prisma');

// Categories — no longer carry a 'type' field; type is on CatalogService
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

// CatalogServices — defines the actual bookable services per category
// Each has a serviceType: FIXED_PRICE or INSPECTION_BASED
const catalogServices = [
    // ── Plumbing ──
    { categorySlug: 'plumbing', name: 'Pipe Leak Repair',           slug: 'pipe-leak-repair',           serviceType: 'INSPECTION_BASED', inspectionFee: 200 },
    { categorySlug: 'plumbing', name: 'Drain Cleaning',             slug: 'drain-cleaning',             serviceType: 'FIXED_PRICE',      basePrice: 800 },
    { categorySlug: 'plumbing', name: 'Tap Replacement',            slug: 'tap-replacement',            serviceType: 'FIXED_PRICE',      basePrice: 600 },
    { categorySlug: 'plumbing', name: 'Water Tank Installation',    slug: 'water-tank-installation',    serviceType: 'INSPECTION_BASED', inspectionFee: 300 },
    { categorySlug: 'plumbing', name: 'Toilet Repair',              slug: 'toilet-repair',              serviceType: 'INSPECTION_BASED', inspectionFee: 200 },

    // ── Electrical ──
    { categorySlug: 'electrical', name: 'Fan Installation',         slug: 'fan-installation',           serviceType: 'FIXED_PRICE',      basePrice: 500 },
    { categorySlug: 'electrical', name: 'Light Installation',       slug: 'light-installation',         serviceType: 'FIXED_PRICE',      basePrice: 400 },
    { categorySlug: 'electrical', name: 'Switch Replacement',       slug: 'switch-replacement',         serviceType: 'FIXED_PRICE',      basePrice: 300 },
    { categorySlug: 'electrical', name: 'Wiring Repair',            slug: 'wiring-repair',              serviceType: 'INSPECTION_BASED', inspectionFee: 300 },
    { categorySlug: 'electrical', name: 'Short-Circuit Diagnosis',  slug: 'short-circuit-diagnosis',    serviceType: 'INSPECTION_BASED', inspectionFee: 250 },

    // ── Cleaning ──
    { categorySlug: 'cleaning', name: 'Standard Home Cleaning',     slug: 'standard-home-cleaning',     serviceType: 'FIXED_PRICE',      basePrice: 1500 },
    { categorySlug: 'cleaning', name: 'Deep Cleaning',              slug: 'deep-cleaning',              serviceType: 'FIXED_PRICE',      basePrice: 3000 },
    { categorySlug: 'cleaning', name: 'Carpet Cleaning',            slug: 'carpet-cleaning',            serviceType: 'FIXED_PRICE',      basePrice: 1200 },
    { categorySlug: 'cleaning', name: 'Office Cleaning',            slug: 'office-cleaning',            serviceType: 'FIXED_PRICE',      basePrice: 2500 },

    // ── Tutoring ──
    { categorySlug: 'tutoring', name: 'Math Tutoring (per session)',   slug: 'math-tutoring',    serviceType: 'FIXED_PRICE', basePrice: 700 },
    { categorySlug: 'tutoring', name: 'Science Tutoring (per session)',slug: 'science-tutoring', serviceType: 'FIXED_PRICE', basePrice: 700 },
    { categorySlug: 'tutoring', name: 'English Tutoring (per session)',slug: 'english-tutoring', serviceType: 'FIXED_PRICE', basePrice: 600 },

    // ── Appliance Repair ──
    { categorySlug: 'appliance-repair', name: 'AC Servicing',         slug: 'ac-servicing',         serviceType: 'FIXED_PRICE',      basePrice: 1200 },
    { categorySlug: 'appliance-repair', name: 'Refrigerator Repair',  slug: 'refrigerator-repair',  serviceType: 'INSPECTION_BASED', inspectionFee: 300 },
    { categorySlug: 'appliance-repair', name: 'Washing Machine Repair',slug: 'washing-machine-repair',serviceType: 'INSPECTION_BASED', inspectionFee: 300 },
    { categorySlug: 'appliance-repair', name: 'TV Repair',            slug: 'tv-repair',            serviceType: 'INSPECTION_BASED', inspectionFee: 250 },

    // ── Carpentry ──
    { categorySlug: 'carpentry', name: 'Furniture Repair',        slug: 'furniture-repair',      serviceType: 'INSPECTION_BASED', inspectionFee: 250 },
    { categorySlug: 'carpentry', name: 'Door / Window Fitting',   slug: 'door-window-fitting',   serviceType: 'FIXED_PRICE',      basePrice: 1500 },
    { categorySlug: 'carpentry', name: 'Shelf Installation',      slug: 'shelf-installation',    serviceType: 'FIXED_PRICE',      basePrice: 800 },

    // ── Painting ──
    { categorySlug: 'painting', name: 'Room Painting',            slug: 'room-painting',          serviceType: 'INSPECTION_BASED', inspectionFee: 500 },
    { categorySlug: 'painting', name: 'Exterior Painting',        slug: 'exterior-painting',      serviceType: 'INSPECTION_BASED', inspectionFee: 500 },
    { categorySlug: 'painting', name: 'Waterproofing',            slug: 'waterproofing',          serviceType: 'INSPECTION_BASED', inspectionFee: 400 },

    // ── Vehicle Mechanic ──
    { categorySlug: 'vehicle-mechanic', name: 'Oil Change',           slug: 'oil-change',           serviceType: 'FIXED_PRICE',      basePrice: 600 },
    { categorySlug: 'vehicle-mechanic', name: 'Puncture Fix',         slug: 'puncture-fix',         serviceType: 'FIXED_PRICE',      basePrice: 300 },
    { categorySlug: 'vehicle-mechanic', name: 'Engine Diagnosis',     slug: 'engine-diagnosis',     serviceType: 'INSPECTION_BASED', inspectionFee: 400 },
    { categorySlug: 'vehicle-mechanic', name: 'Full Bike Servicing',  slug: 'full-bike-servicing',  serviceType: 'FIXED_PRICE',      basePrice: 1800 },
];

async function main() {
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
        if (!categoryId) {
            console.warn(`Category not found for slug: ${svc.categorySlug}`);
            continue;
        }

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
    console.log('✅ Catalog services seeded');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });