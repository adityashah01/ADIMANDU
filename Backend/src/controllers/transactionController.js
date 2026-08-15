const prisma = require("../lib/prisma");

const PLATFORM_FEE_RATE = 0.10; // 10%

// Create ledger entries after payment verification
async function createBookingLedger(bookingId, totalAmount) {
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE * 100) / 100;
    const providerEarning = Math.round((totalAmount - platformFee) * 100) / 100;

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                bookingId,
                type: "SERVICE_PAYMENT",
                amount: totalAmount,
                status: "COMPLETED",
                description: "Customer payment received",
            },
        }),
        prisma.transaction.create({
            data: {
                bookingId,
                type: "PLATFORM_FEE",
                amount: platformFee,
                status: "COMPLETED",
                description: "Platform commission (10%)",
            },
        }),
        prisma.transaction.create({
            data: {
                bookingId,
                type: "PROVIDER_EARNING",
                amount: providerEarning,
                status: "COMPLETED",
                description: "Provider earning after platform fee",
            },
        }),
    ]);
}

// Create ledger entries after service request payment verification
async function createServiceRequestLedger(serviceRequestId, totalAmount) {
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE * 100) / 100;
    const providerEarning = Math.round((totalAmount - platformFee) * 100) / 100;

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                serviceRequestId,
                type: "SERVICE_PAYMENT",
                amount: totalAmount,
                status: "COMPLETED",
                description: "Customer payment received",
            },
        }),
        prisma.transaction.create({
            data: {
                serviceRequestId,
                type: "PLATFORM_FEE",
                amount: platformFee,
                status: "COMPLETED",
                description: "Platform commission (10%)",
            },
        }),
        prisma.transaction.create({
            data: {
                serviceRequestId,
                type: "PROVIDER_EARNING",
                amount: providerEarning,
                status: "COMPLETED",
                description: "Provider earning after platform fee",
            },
        }),
    ]);
}

// GET /api/transactions/provider — provider's earning ledger
async function getProviderTransactions(req, res) {
    try {
        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(404).json({ error: "Provider not found." });

        // Get all booking IDs for this provider
        const bookingIds = (await prisma.booking.findMany({
            where: { providerId: provider.id },
            select: { id: true },
        })).map((b) => b.id);

        const requestIds = (await prisma.serviceRequest.findMany({
            where: { providerId: provider.id },
            select: { id: true },
        })).map((r) => r.id);

        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { bookingId: { in: bookingIds } },
                    { serviceRequestId: { in: requestIds } },
                ],
                type: { in: ["PROVIDER_EARNING", "PLATFORM_FEE", "SERVICE_PAYMENT"] },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(transactions);
    } catch (error) {
        console.error("getProviderTransactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /api/transactions/booking/:bookingId
async function getBookingTransactions(req, res) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { bookingId: req.params.bookingId },
            orderBy: { createdAt: "asc" },
        });
        res.json(transactions);
    } catch (error) {
        console.error("getBookingTransactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createBookingLedger,
    createServiceRequestLedger,
    getProviderTransactions,
    getBookingTransactions,
};
