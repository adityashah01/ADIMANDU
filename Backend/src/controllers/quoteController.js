const prisma = require("../lib/prisma");

async function submitQuote(req, res) {
    try {
        const { bookingId } = req.params;
        const { amount, notes } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { provider: true }
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        // Must be the provider for this booking
        if (booking.provider.userId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized." });
        }

        if (booking.bookingType !== 'INSPECTION') {
            return res.status(400).json({ error: "Quotes are only allowed for inspection-based bookings." });
        }

        const quote = await prisma.quote.upsert({
            where: { bookingId },
            update: {
                amount,
                notes,
                status: 'PENDING',
                submittedAt: new Date()
            },
            create: {
                bookingId,
                amount,
                notes
            }
        });

        // Update booking quoted price
        await prisma.booking.update({
            where: { id: bookingId },
            data: { quotedPrice: amount }
        });

        // Create notification for customer
        await prisma.notification.create({
            data: {
                userId: booking.customerId,
                type: 'QUOTE_SUBMITTED',
                title: 'New Quote Received',
                message: `Provider has submitted a quote of Rs. ${amount} for your booking ${booking.bookingNumber}.`,
                link: `/bookings/${booking.id}`
            }
        });

        return res.json({ message: "Quote submitted successfully.", quote });
    } catch (error) {
        console.error("Submit Quote Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function respondToQuote(req, res) {
    try {
        const { bookingId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: "Invalid action." });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { quote: true, provider: true }
        });

        if (!booking || !booking.quote) {
            return res.status(404).json({ error: "Booking or quote not found." });
        }

        if (booking.customerId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized." });
        }

        if (booking.quote.status !== 'PENDING') {
            return res.status(400).json({ error: `Quote has already been ${booking.quote.status.toLowerCase()}.` });
        }

        const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

        const updatedQuote = await prisma.quote.update({
            where: { bookingId },
            data: {
                status: newStatus,
                respondedAt: new Date()
            }
        });

        // Update booking based on action
        if (action === 'accept') {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { finalPrice: booking.quote.amount }
                // In future: update paymentStatus to ESCROW_HELD if payment goes through
            });
        } else {
            // Rejection might cancel the booking
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED', cancelledAt: new Date() }
            });
        }

        // Notify provider
        await prisma.notification.create({
            data: {
                userId: booking.provider.userId,
                type: action === 'accept' ? 'QUOTE_ACCEPTED' : 'QUOTE_REJECTED',
                title: `Quote ${newStatus}`,
                message: `Customer has ${newStatus.toLowerCase()} your quote for booking ${booking.bookingNumber}.`,
                link: `/provider/bookings/${booking.id}`
            }
        });

        return res.json({ message: `Quote ${newStatus.toLowerCase()} successfully.`, quote: updatedQuote });
    } catch (error) {
        console.error("Respond to Quote Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    submitQuote,
    respondToQuote
};
