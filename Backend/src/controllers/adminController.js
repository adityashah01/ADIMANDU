const prisma = require("../lib/prisma");

// =========================================
// Dashboard Stats
// =========================================
async function getDashboardStats(req, res) {
    try {
        const [
            totalUsers,
            totalProviders,
            totalBookings,
            pendingApplications,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.providerProfile.count(),
            prisma.booking.count(),
            prisma.providerApplication.count({
                where: { status: "PENDING" },
            }),
        ]);

        return res.json({
            totalUsers,
            totalProviders,
            totalBookings,
            pendingApplications,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Get Pending Applications
// =========================================
async function getPendingApplications(req, res) {
    try {
        const applications = await prisma.providerApplication.findMany({
            where: {
                status: "PENDING",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(applications);
    } catch (error) {
        console.error("Get Applications Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Approve Application
// =========================================
async function approveApplication(req, res) {
    try {
        const { id } = req.params;

        const application = await prisma.providerApplication.findUnique({
            where: { id },
        });

        if (!application) {
            return res.status(404).json({
                error: "Application not found.",
            });
        }

        if (application.status !== "PENDING") {
            return res.status(400).json({
                error: "Application has already been reviewed.",
            });
        }

        // Update application status
        await prisma.providerApplication.update({
            where: { id },
            data: {
                status: "APPROVED",
                adminNote: req.body.adminNote || null,
                reviewedAt: new Date(),
            },
        });

        // Create provider profile if user exists
        if (application.userId) {
            // Update user role to PROVIDER
            await prisma.user.update({
                where: { id: application.userId },
                data: { role: "PROVIDER" },
            });

            // Create the provider profile
            await prisma.providerProfile.create({
                data: {
                    userId: application.userId,
                    categoryId: application.categoryId,
                    bio: application.bio,
                    location: application.location,
                    skills: application.skills,
                    experience: application.experience,
                    price: 0,
                    verified: true,
                },
            });
        }

        return res.json({
            message: "Application approved successfully.",
        });
    } catch (error) {
        console.error("Approve Application Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Reject Application
// =========================================
async function rejectApplication(req, res) {
    try {
        const { id } = req.params;

        const application = await prisma.providerApplication.findUnique({
            where: { id },
        });

        if (!application) {
            return res.status(404).json({
                error: "Application not found.",
            });
        }

        if (application.status !== "PENDING") {
            return res.status(400).json({
                error: "Application has already been reviewed.",
            });
        }

        await prisma.providerApplication.update({
            where: { id },
            data: {
                status: "REJECTED",
                adminNote: req.body.adminNote || null,
                reviewedAt: new Date(),
            },
        });

        return res.json({
            message: "Application rejected.",
        });
    } catch (error) {
        console.error("Reject Application Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Get All Users
// =========================================
async function getAllUsers(req, res) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Get Platform Earnings (Admin)
// =========================================
async function getPlatformEarnings(req, res) {
    try {
        // Fetch all booking-based transactions with customer and provider info
        const bookingRows = await prisma.booking.findMany({
            where: {
                OR: [
                    { paymentStatus: { in: ["PAID", "ESCROW_HELD", "RELEASED"] } },
                    { status: "COMPLETED" },
                ],
            },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                catalogService: { select: { name: true } },
                transactions: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Fetch all service-request-based transactions
        const requestRows = await prisma.serviceRequest.findMany({
            where: {
                OR: [
                    { paymentStatus: { in: ["PAID", "ESCROW_HELD", "RELEASED"] } },
                    { status: "COMPLETED" },
                ],
            },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                transactions: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const format = (rows, type) =>
            rows.map((row) => {
                const payment = row.transactions.find((t) => t.type === "SERVICE_PAYMENT");
                const fee = row.transactions.find((t) => t.type === "PLATFORM_FEE");
                const earning = row.transactions.find((t) => t.type === "PROVIDER_EARNING");

                // Prisma Decimals come back as strings — parse them safely
                const rawAmount = payment?.amount
                    ? Number(payment.amount.toString())
                    : Number((type === "booking" ? row.quotedPrice : row.finalAmount)?.toString() || 0);

                const totalAmount = rawAmount;
                const platformFee = fee ? Number(fee.amount.toString()) : Math.round(totalAmount * 0.10 * 100) / 100;
                const providerEarning = earning ? Number(earning.amount.toString()) : Math.round((totalAmount - platformFee) * 100) / 100;

                return {
                    id: row.id,
                    type,
                    service: type === "booking" ? (row.catalogService?.name || "Service") : row.serviceName,
                    customer: row.customer,
                    provider: row.provider?.user,
                    paymentMethod: row.paymentMethod,
                    paymentStatus: row.paymentStatus,
                    totalAmount,
                    platformFee,
                    providerEarning,
                    date: row.createdAt,
                };
            });

        // Deduplicate by id in case OR query returns same row twice
        const seen = new Set();
        const earnings = [
            ...format(bookingRows, "booking"),
            ...format(requestRows, "service_request"),
        ]
            .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalRevenue = earnings.reduce((s, e) => s + e.totalAmount, 0);
        const totalPlatformFee = earnings.reduce((s, e) => s + e.platformFee, 0);
        const totalProviderPayout = earnings.reduce((s, e) => s + e.providerEarning, 0);

        return res.json({
            summary: { totalRevenue, totalPlatformFee, totalProviderPayout, count: earnings.length },
            earnings,
        });
    } catch (error) {
        console.error("getPlatformEarnings error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// =========================================
// Get All Bookings
// =========================================
async function getAllBookings(req, res) {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                provider: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(bookings);
    } catch (error) {
        console.error("Get Bookings Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

module.exports = {
    getDashboardStats,
    getPendingApplications,
    approveApplication,
    rejectApplication,
    getAllUsers,
    getAllBookings,
    getPlatformEarnings,
};