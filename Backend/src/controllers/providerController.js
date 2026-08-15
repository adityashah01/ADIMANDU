
const prisma = require("../lib/prisma");
const { calculateDistance } = require("../utils/distance");

async function apply(req, res) {
    console.log(req.body);
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found.",
            });
        }

        const {
            phone,
            location,
            latitude,
            longitude,
            categoryId,
            skills,
            experience,
            bio,
            profileImageUrl,
        } = req.body;

        if (
            !phone ||
            !categoryId ||
            !skills ||
            !experience
        ) {
            return res.status(400).json({
                error:
                    " phone, category, skills and experience are required.",
            });
        }

        // Check if user already applied
        const existingApplication =
            await prisma.providerApplication.findUnique({
                where: {
                    userId,
                },
            });

        if (existingApplication) {
            return res.status(409).json({
                error: "You have already submitted an application.",
            });
        }

        // Check if user is already a provider
        const provider = await prisma.providerProfile.findUnique({
            where: {
                userId,
            },
        });

        if (provider) {
            return res.status(409).json({
                error: "You are already a registered provider.",
            });
        }

        // Check category exists
        const category = await prisma.category.findUnique({
            where: {
                slug: categoryId,
            },
        });

        if (!category) {
            return res.status(404).json({
                error: "Category not found.",
            });
        }

        const application = await prisma.providerApplication.create({
            data: {
                userId,
                name: user.name,
                email: user.email,
                phone,
                location,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                categoryId: category.id,
                skills: Array.isArray(skills)
                    ? skills
                    : skills.split(",").map((s) => s.trim()),
                experience,
                bio,
                profileImageUrl,
            },
        });

        return res.status(201).json({
            message: "Application submitted successfully.",
            application,
        });
    } catch (error) {
        console.error("Provider Application Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

async function getAllProviders(req, res) {
    try {
        const { category, search, catalogServiceId, lat, lng } = req.query;

        const where = {
            verified: true,
        };

        if (category) {
            where.category = { OR: [{ id: category }, { slug: category }] };
        }

        if (catalogServiceId) {
            where.providerServices = {
                some: { catalogServiceId, isActive: true },
            };
        }

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { category: { name: { contains: search, mode: 'insensitive' } } },
                { skills: { hasSome: [search] } },
            ];
        }

        const providers = await prisma.providerProfile.findMany({
            where,
            include: {
                user: { select: { name: true, avatarUrl: true, phone: true } },
                category: { select: { name: true, id: true, slug: true } },
            }
        });

        const userLat = lat ? parseFloat(lat) : null;
        const userLng = lng ? parseFloat(lng) : null;

        const formattedProviders = providers.map(p => {
            const distance = (userLat && userLng && p.latitude && p.longitude)
                ? calculateDistance(userLat, userLng, p.latitude, p.longitude)
                : null;

            return {
                id: p.id,
                name: p.user.name,
                avatar: p.user.avatarUrl,
                categoryId: p.category.slug,
                category: p.category.name,
                phone: p.user.phone,
                rating: p.averageRating,
                reviewCount: p.reviewCount,
                location: p.location,
                latitude: p.latitude,
                longitude: p.longitude,
                price: p.price,
                priceUnit: p.priceUnit,
                priceType: p.priceType,
                availability: p.isAvailable ? 'available' : 'busy',
                verified: p.verified,
                skills: p.skills,
                experience: p.experience,
                responseTime: '< 1 hr',
                distance: distance || 0
            };
        });

        // Sort by distance if user location is provided
        if (userLat && userLng) {
            formattedProviders.sort((a, b) => {
                if (a.distance === 0 && b.distance !== 0) return 1;
                if (a.distance !== 0 && b.distance === 0) return -1;
                return a.distance - b.distance;
            });
        }

        res.json(formattedProviders);
    } catch (error) {
        console.error("Fetch Providers Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getProviderById(req, res) {
    try {
        const { id } = req.params;
        const { lat, lng } = req.query;

        const provider = await prisma.providerProfile.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, avatarUrl: true, phone: true } },
                category: { select: { name: true, id: true, slug: true } },
                reviews: {
                    include: {
                        customer: { select: { name: true, avatarUrl: true } }
                    }
                }
            }
        });

        if (!provider) {
            return res.status(404).json({ error: "Provider not found." });
        }

        const userLat = lat ? parseFloat(lat) : null;
        const userLng = lng ? parseFloat(lng) : null;
        const distance = (userLat && userLng && provider.latitude && provider.longitude)
            ? calculateDistance(userLat, userLng, provider.latitude, provider.longitude)
            : null;

        const formattedProvider = {
            id: provider.id,
            name: provider.user.name,
            avatar: provider.user.avatarUrl,
            categoryId: provider.category.slug,
            category: provider.category.name,
            phone: provider.user.phone,
            bio: provider.bio,
            rating: provider.averageRating,
            reviewCount: provider.reviewCount,
            location: provider.location,
            latitude: provider.latitude,
            longitude: provider.longitude,
            price: provider.price,
            priceUnit: provider.priceUnit,
            priceType: provider.priceType,
            availability: provider.isAvailable ? 'available' : 'busy',
            verified: provider.verified,
            skills: provider.skills,
            experience: provider.experience,
            responseTime: '< 1 hr',
            distance: distance || 0,
            completedJobs: provider.jobsCompleted,
            reviews: provider.reviews.map(r => ({
                id: r.id,
                author: r.customer.name,
                avatar: r.customer.avatarUrl,
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt
            }))
        };

        res.json(formattedProvider);
    } catch (error) {
        console.error("Fetch Provider By ID Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    apply,
    getAllProviders,
    getProviderById
};