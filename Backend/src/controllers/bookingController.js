const prisma = require("../lib/prisma");

// Generate booking number
function generateBookingNumber() {
    return (
        "BK" +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 1000)
    );
}

// ----------------------------
// Create Booking
// ----------------------------
async function createBooking(req, res) {
    try {
        const customerId = req.user.id;

        const {
            providerId,
            serviceId,
            catalogServiceId,
            serviceName,
            scheduledDate,
            timeSlot,
            address,
            landmark,
            notes,
            contactName,
            contactPhone,
            paymentMethod,
        } = req.body;

        if (
            !providerId ||
            !serviceName ||
            !scheduledDate ||
            !timeSlot ||
            !address ||
            !contactName ||
            !contactPhone
        ) {
            return res.status(400).json({
                error: "Please fill all required fields.",
            });
        }

        // Validate past date/time
        // We use UTC for all comparisons to be timezone-independent of the server
        const [year, month, day] = scheduledDate.split('-').map(Number);
        const [time, modifier] = timeSlot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        // Construct the date in Nepal Time (UTC+5:45)
        // We first create it as if it were UTC
        const slotInNepal = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        // Adjust to actual UTC: UTC = NepalTime - 5:45
        const nepalOffsetInMs = (5 * 60 + 45) * 60 * 1000;
        const slotInUTC = new Date(slotInNepal.getTime() - nepalOffsetInMs);

        const now = new Date();
        const gracePeriod = 30 * 60 * 1000; // 30 minutes grace

        if (slotInUTC.getTime() < now.getTime() - gracePeriod) {
            return res.status(400).json({
                error: "This time slot has already passed for today.",
            });
        }

        const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        // Check for conflicts
        const existingBooking = await prisma.booking.findFirst({
            where: {
                providerId,
                scheduledDate: {
                    gte: dayStart,
                    lte: dayEnd,
                },
                timeSlot,
                status: {
                    in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
                },
            },
        });

        if (existingBooking) {
            return res.status(400).json({
                error: "This provider is already booked for the selected time. Please choose another time or provider.",
            });
        }

        const provider = await prisma.providerProfile.findUnique({
            where: {
                id: providerId,
            },
        });

        if (!provider) {
            return res.status(404).json({
                error: "Provider not found.",
            });
        }

        let priceToQuote = provider.price;
        if (catalogServiceId) {
            const catalogService = await prisma.catalogService.findUnique({
                where: { id: catalogServiceId },
            });
            if (catalogService && catalogService.basePrice) {
                priceToQuote = catalogService.basePrice;
            }
        }

        const booking = await prisma.booking.create({
            data: {
                bookingNumber: generateBookingNumber(),
                customerId,
                providerId,
                serviceId,
                catalogServiceId,
                serviceName,
                scheduledDate: dayStart,
                timeSlot,
                address,
                landmark,
                notes,
                contactName,
                contactPhone,
                quotedPrice: priceToQuote,
                paymentMethod,
            },
        });

        return res.status(201).json({
            message: "Booking created successfully.",
            booking,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}

// ----------------------------
// Customer Bookings
// ----------------------------
async function getCustomerBookings(req, res) {

    try {

        const bookings = await prisma.booking.findMany({
            where: {
                customerId: req.user.id,
            },
            include: {
                provider: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(bookings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// ----------------------------
// Provider Bookings
// ----------------------------
async function getProviderBookings(req, res) {

    try {

        const provider = await prisma.providerProfile.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!provider) {
            return res.status(404).json({
                error: "Provider not found.",
            });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                providerId: provider.id,
            },
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(bookings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// ----------------------------
// Get Booking Details
// ----------------------------
async function getBookingById(req, res) {

    try {

        const booking = await prisma.booking.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                customer: true,
                provider: {
                    include: {
                        user: true,
                    },
                },
                service: true,
            },
        });

        if (!booking) {

            return res.status(404).json({
                error: "Booking not found.",
            });

        }

        res.json(booking);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// ----------------------------
// Update Booking Status
// ----------------------------
async function updateBookingStatus(req, res) {

    try {
        const { status } = req.body;

        const existing = await prisma.booking.findUnique({
            where: { id: req.params.id },
        });

        if (!existing) {
            return res.status(404).json({ error: "Booking not found." });
        }

        let paymentUpdate = {};
        if (req.body.paymentStatus) {
            paymentUpdate = { paymentStatus: req.body.paymentStatus };
        } else if (status === "COMPLETED" && existing.status !== "COMPLETED") {
            const amount = existing.finalPrice || existing.quotedPrice || 0;
            const commission = Number(amount) * 0.10;
            const earnings = Number(amount) * 0.90;

            if (existing.paymentMethod === 'CASH') {
                await prisma.providerProfile.update({
                    where: { id: existing.providerId },
                    data: {
                        walletBalance: { decrement: commission },
                        totalEarnings: { increment: earnings }
                    }
                });
                // Default to PAID if not specified
                paymentUpdate = { paymentStatus: 'PAID' };
            }
        }

        const booking = await prisma.booking.update({
            where: {
                id: req.params.id,
            },
            data: {
                status,
                ...paymentUpdate,
                ...(status === "CONFIRMED" && {
                    confirmedAt: new Date(),
                }),

                ...(status === "COMPLETED" && {
                    completedAt: new Date(),
                }),

                ...(status === "CANCELLED" && {
                    cancelledAt: new Date(),
                }),

            },

        });

        res.json({
            message: "Booking updated successfully.",
            booking,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}

// ----------------------------
// Cancel Booking
// ----------------------------
async function cancelBooking(req, res) {

    try {
        const { reason } = req.body;

        const booking = await prisma.booking.update({

            where: {
                id: req.params.id,
            },

            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancellationReason: reason,
            },

        });

        res.json({
            message: "Booking cancelled.",
            booking,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error",
        });

    }

}


// ----------------------------
// Customer Confirm Completion
// ----------------------------
async function customerConfirmCompletion(req, res) {
    try {
        const { id } = req.params;
        const { confirmed } = req.body;
        
        const booking = await prisma.booking.update({
            where: { id },
            data: {
                customerConfirmedAt: confirmed ? new Date() : null,
            },
        });
        
        res.json(booking);
    } catch (error) {
        console.error("customerConfirmCompletion error:", error);
        res.status(500).json({ error: "Failed to update completion status." });
    }
}

// ----------------------------
// Update Payment Status (Provider)
// ----------------------------
async function updatePaymentStatus(req, res) {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        
        const booking = await prisma.booking.update({
            where: { id },
            data: { paymentStatus },
        });
        
        res.json(booking);
    } catch (error) {
        console.error("updatePaymentStatus error:", error);
        res.status(500).json({ error: "Failed to update payment status." });
    }
}

// ----------------------------
// Get Booked Slots for Provider & Date
// ----------------------------
async function getBookedSlots(req, res) {
    try {
        const { providerId } = req.params;
        const { date } = req.query; // format YYYY-MM-DD
        if (!providerId || !date) {
            return res.status(400).json({ error: "providerId and date are required." });
        }

        const [year, month, day] = date.split('-').map(Number);
        if (!year || !month || !day) {
            return res.json({ bookedSlots: [] });
        }

        const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const bookings = await prisma.booking.findMany({
            where: {
                providerId,
                scheduledDate: {
                    gte: dayStart,
                    lte: dayEnd,
                },
                status: {
                    in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
                },
            },
            select: {
                timeSlot: true,
            },
        });

        const bookedSlots = bookings.map((b) => b.timeSlot);
        return res.json({ bookedSlots });
    } catch (error) {
        console.error("Get Booked Slots Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createBooking,
    getBookedSlots,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    customerConfirmCompletion,
    updatePaymentStatus
};