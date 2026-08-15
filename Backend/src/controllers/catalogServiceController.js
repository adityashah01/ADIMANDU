const prisma = require("../lib/prisma");

// GET /api/catalog-services?categoryId=xxx&serviceType=FIXED_PRICE
async function getCatalogServices(req, res) {
    try {
        const { categoryId, serviceType } = req.query;
        const where = { isActive: true };

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: { OR: [{ id: categoryId }, { slug: categoryId }] },
            });
            if (!category) return res.status(404).json({ error: "Category not found." });
            where.categoryId = category.id;
        }

        if (serviceType) where.serviceType = serviceType;

        const services = await prisma.catalogService.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                _count: { select: { providerServices: { where: { isActive: true } } } },
            },
            orderBy: { name: "asc" },
        });

        res.json(services.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            description: s.description,
            serviceType: s.serviceType,
            basePrice: s.basePrice ? Number(s.basePrice) : null,
            inspectionFee: s.inspectionFee ? Number(s.inspectionFee) : null,
            imageUrl: s.imageUrl,
            category: s.category,
            providerCount: s._count.providerServices,
        })));
    } catch (error) {
        console.error("getCatalogServices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /api/catalog-services/:id
async function getCatalogServiceById(req, res) {
    try {
        const service = await prisma.catalogService.findFirst({
            where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                _count: { select: { providerServices: { where: { isActive: true } } } },
            },
        });

        if (!service) return res.status(404).json({ error: "Service not found." });

        res.json({
            id: service.id,
            name: service.name,
            slug: service.slug,
            description: service.description,
            serviceType: service.serviceType,
            basePrice: service.basePrice ? Number(service.basePrice) : null,
            inspectionFee: service.inspectionFee ? Number(service.inspectionFee) : null,
            imageUrl: service.imageUrl,
            category: service.category,
            providerCount: service._count.providerServices,
        });
    } catch (error) {
        console.error("getCatalogServiceById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /api/catalog-services/:id/providers
async function getCatalogServiceProviders(req, res) {
    try {
        const catalogService = await prisma.catalogService.findFirst({
            where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
        });

        if (!catalogService) return res.status(404).json({ error: "Service not found." });

        const links = await prisma.providerService.findMany({
            where: {
                catalogServiceId: catalogService.id,
                isActive: true,
                provider: { verified: true },
            },
            include: {
                provider: {
                    include: {
                        user: { select: { name: true, avatarUrl: true, phone: true } },
                        category: { select: { name: true, slug: true } },
                    },
                },
            },
        });

        res.json(links.map((ps) => {
            const p = ps.provider;
            return {
                id: p.id,
                name: p.user.name,
                avatar: p.user.avatarUrl,
                category: p.category.name,
                categoryId: p.category.slug,
                phone: p.user.phone,
                rating: p.averageRating,
                reviewCount: p.reviewCount,
                location: p.location,
                price: ps.customPrice ? Number(ps.customPrice) : Number(p.price),
                priceUnit: p.priceUnit,
                priceType: p.priceType,
                availability: p.isAvailable ? "available" : "busy",
                verified: p.verified,
                skills: p.skills,
                experience: p.experience,
                responseTime: "< 1 hr",
                distance: 2.0,
            };
        }));
    } catch (error) {
        console.error("getCatalogServiceProviders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ADMIN: POST /api/catalog-services
async function createCatalogService(req, res) {
    try {
        const { categoryId, name, slug, description, serviceType, basePrice, inspectionFee, imageUrl } = req.body;

        if (!categoryId || !name || !slug || !serviceType) {
            return res.status(400).json({ error: "categoryId, name, slug, serviceType are required." });
        }

        const service = await prisma.catalogService.create({
            data: {
                categoryId,
                name,
                slug,
                description,
                serviceType,
                basePrice: basePrice ? Number(basePrice) : null,
                inspectionFee: inspectionFee ? Number(inspectionFee) : null,
                imageUrl,
            },
        });

        res.status(201).json(service);
    } catch (error) {
        if (error.code === "P2002") return res.status(409).json({ error: "Slug already exists." });
        console.error("createCatalogService:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ADMIN: PATCH /api/catalog-services/:id
async function updateCatalogService(req, res) {
    try {
        const { name, description, serviceType, basePrice, inspectionFee, imageUrl, isActive } = req.body;

        const service = await prisma.catalogService.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(serviceType && { serviceType }),
                ...(basePrice !== undefined && { basePrice: basePrice ? Number(basePrice) : null }),
                ...(inspectionFee !== undefined && { inspectionFee: inspectionFee ? Number(inspectionFee) : null }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        res.json(service);
    } catch (error) {
        console.error("updateCatalogService:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getCatalogServices,
    getCatalogServiceById,
    getCatalogServiceProviders,
    createCatalogService,
    updateCatalogService,
};
