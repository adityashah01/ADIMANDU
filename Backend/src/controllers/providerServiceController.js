const prisma = require("../lib/prisma");

// GET /api/provider-services — list this provider's services
async function getMyServices(req, res) {
    try {
        const provider = await prisma.providerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!provider) return res.status(404).json({ error: "Provider profile not found." });

        const providerServices = await prisma.providerService.findMany({
            where: { providerId: provider.id },
            include: {
                catalogService: {
                    select: { id: true, name: true, serviceType: true, basePrice: true, inspectionFee: true, description: true }
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(providerServices.map(ps => ({
            id: ps.id,
            catalogServiceId: ps.catalogServiceId,
            name: ps.catalogService.name,
            type: ps.catalogService.serviceType,
            basePrice: ps.catalogService.basePrice ? Number(ps.catalogService.basePrice) : null,
            inspectionFee: ps.catalogService.inspectionFee ? Number(ps.catalogService.inspectionFee) : null,
            customPrice: ps.customPrice ? Number(ps.customPrice) : null,
            isActive: ps.isActive,
            description: ps.catalogService.description,
        })));
    } catch (error) {
        console.error("getMyServices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// POST /api/provider-services — add a catalog service to this provider's offerings
async function addService(req, res) {
    try {
        const { catalogServiceId, customPrice } = req.body;
        if (!catalogServiceId) return res.status(400).json({ error: "catalogServiceId is required." });

        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(404).json({ error: "Provider profile not found." });

        const ps = await prisma.providerService.upsert({
            where: { providerId_catalogServiceId: { providerId: provider.id, catalogServiceId } },
            update: { isActive: true, customPrice: customPrice ? Number(customPrice) : null },
            create: { providerId: provider.id, catalogServiceId, customPrice: customPrice ? Number(customPrice) : null },
        });

        res.status(201).json({ id: ps.id, message: "Service added." });
    } catch (error) {
        console.error("addService:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PATCH /api/provider-services/:id — update custom price or toggle active
async function updateService(req, res) {
    try {
        const { customPrice, isActive } = req.body;
        const ps = await prisma.providerService.update({
            where: { id: req.params.id },
            data: {
                ...(customPrice !== undefined && { customPrice: customPrice ? Number(customPrice) : null }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json(ps);
    } catch (error) {
        console.error("updateService:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// DELETE /api/provider-services/:id — remove service offering
async function removeService(req, res) {
    try {
        await prisma.providerService.delete({ where: { id: req.params.id } });
        res.json({ message: "Service removed." });
    } catch (error) {
        console.error("removeService:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { getMyServices, addService, updateService, removeService };
