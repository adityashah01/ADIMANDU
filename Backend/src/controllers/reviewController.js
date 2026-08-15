const prisma = require("../lib/prisma");

// =========================================
// Create Review
// =========================================
async function createReview(req, res) {
    try {
        const customerId = req.user.id;
        const bookingId = req.params.bookingId;

        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5.",
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
        });

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found.",
            });
        }

        if (booking.customerId !== customerId) {
            return res.status(403).json({
                error: "Unauthorized.",
            });
        }

        if (booking.status !== "COMPLETED") {
            return res.status(400).json({
                error: "Only completed bookings can be reviewed.",
            });
        }

        const alreadyReviewed = await prisma.review.findUnique({
            where: {
                bookingId,
            },
        });

        if (alreadyReviewed) {
            return res.status(409).json({
                error: "Review already submitted.",
            });
        }

        const review = await prisma.review.create({
            data: {
                bookingId,
                customerId,
                providerId: booking.providerId,
                rating,
                comment,
            },
        });

        await updateProviderRating(booking.providerId);

        res.status(201).json({
            message: "Review submitted successfully.",
            review,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// =========================================
// Update Review
// =========================================
async function updateReview(req, res) {

    try {

        const { rating, comment } = req.body;

        const review = await prisma.review.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!review) {
            return res.status(404).json({
                error: "Review not found.",
            });
        }

        if (review.customerId !== req.user.id) {
            return res.status(403).json({
                error: "Unauthorized.",
            });
        }

        const updated = await prisma.review.update({
            where: {
                id: req.params.id,
            },
            data: {
                rating,
                comment,
            },
        });

        await updateProviderRating(review.providerId);

        res.json(updated);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// =========================================
// Provider Reply
// =========================================
async function replyToReview(req, res) {

    try {

        const { providerReply } = req.body;

        const review = await prisma.review.update({

            where: {
                id: req.params.id,
            },

            data: {
                providerReply,
            },

        });

        res.json({
            message: "Reply added.",
            review,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// =========================================
// Get Reviews of Provider
// =========================================
async function getProviderReviews(req, res) {

    try {

        const reviews = await prisma.review.findMany({

            where: {
                providerId: req.params.providerId,
            },

            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

        });

        res.json(reviews);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// =========================================
// Delete Review
// =========================================
async function deleteReview(req, res) {

    try {

        const review = await prisma.review.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!review) {
            return res.status(404).json({
                error: "Review not found.",
            });
        }

        if (review.customerId !== req.user.id) {
            return res.status(403).json({
                error: "Unauthorized.",
            });
        }

        await prisma.review.delete({
            where: {
                id: req.params.id,
            },
        });

        await updateProviderRating(review.providerId);

        res.json({
            message: "Review deleted.",
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// =========================================
// Helper Function
// =========================================
async function updateProviderRating(providerId) {

    const result = await prisma.review.aggregate({

        where: {
            providerId,
        },

        _avg: {
            rating: true,
        },

        _count: {
            rating: true,
        },

    });

    await prisma.providerProfile.update({

        where: {
            id: providerId,
        },

        data: {
            averageRating: result._avg.rating || 0,
            reviewCount: result._count.rating,
        },

    });

}

module.exports = {
    createReview,
    updateReview,
    replyToReview,
    getProviderReviews,
    deleteReview,
};