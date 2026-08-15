const prisma = require("../lib/prisma");

function generateRequestNumber() {
    return "SR" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
}

// ─────────────────────────────────────────────
// POST /api/service-requests
// Customer creates a service request (Category B)
// ─────────────────────────────────────────────
async function createServiceRequest(req, res) {
    try {
        const customerId = req.user.id;
        const { providerId, catalogServiceId, serviceName, description, address, images, paymentMethod } = req.body;

        if (!providerId || !catalogServiceId || !serviceName || !description || !address) {
            return res.status(400).json({ error: "providerId, catalogServiceId, serviceName, description, address are required." });
        }

        // Validate catalog service is INSPECTION_BASED
        const catalogService = await prisma.catalogService.findUnique({
            where: { id: catalogServiceId },
        });

        if (!catalogService) return res.status(404).json({ error: "Service not found." });

        if (catalogService.serviceType !== "INSPECTION_BASED") {
            return res.status(400).json({ error: "This service uses fixed-price booking, not service requests." });
        }

        const provider = await prisma.providerProfile.findUnique({
            where: { id: providerId },
        });

        if (!provider) return res.status(404).json({ error: "Provider not found." });

        const request = await prisma.serviceRequest.create({
            data: {
                requestNumber: generateRequestNumber(),
                customerId,
                providerId,
                catalogServiceId,
                serviceName,
                description,
                address,
                images: images || [],
                inspectionFee: catalogService.inspectionFee,
                paymentMethod,
            },
            include: {
                provider: { include: { user: { select: { name: true, avatarUrl: true } } } },
                catalogService: { select: { name: true, serviceType: true } },
            },
        });

        // Notify provider
        await prisma.notification.create({
            data: {
                userId: provider.userId,
                type: "SERVICE_REQUEST_CREATED",
                title: "New Service Request",
                message: `You have a new service request for ${serviceName}.`,
                link: `/provider/service-requests/${request.id}`,
            },
        });

        res.status(201).json({ message: "Service request submitted successfully.", request });
    } catch (error) {
        console.error("createServiceRequest:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// GET /api/service-requests/customer
// ─────────────────────────────────────────────
async function getCustomerRequests(req, res) {
    try {
        const requests = await prisma.serviceRequest.findMany({
            where: { customerId: req.user.id },
            include: {
                provider: { include: { user: { select: { name: true, avatarUrl: true } } } },
                catalogService: { select: { name: true, serviceType: true } },
                inspection: true,
                quote: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(requests);
    } catch (error) {
        console.error("getCustomerRequests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// GET /api/service-requests/provider
// ─────────────────────────────────────────────
async function getProviderRequests(req, res) {
    try {
        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });

        if (!provider) return res.status(404).json({ error: "Provider profile not found." });

        const requests = await prisma.serviceRequest.findMany({
            where: { providerId: provider.id },
            include: {
                customer: { select: { name: true, avatarUrl: true, phone: true } },
                catalogService: { select: { name: true, serviceType: true } },
                inspection: true,
                quote: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(requests);
    } catch (error) {
        console.error("getProviderRequests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// GET /api/service-requests/:id
// ─────────────────────────────────────────────
async function getServiceRequestById(req, res) {
    try {
        const request = await prisma.serviceRequest.findUnique({
            where: { id: req.params.id },
            include: {
                customer: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
                provider: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
                        category: { select: { name: true } },
                    },
                },
                catalogService: { select: { name: true, serviceType: true, inspectionFee: true } },
                inspection: true,
                quote: true,
                review: true,
            },
        });

        if (!request) return res.status(404).json({ error: "Service request not found." });

        // Authorization: only customer or provider can view
        const userId = req.user.id;
        const isCustomer = request.customerId === userId;
        const isProvider = request.provider.userId === userId;

        if (!isCustomer && !isProvider && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized." });
        }

        res.json(request);
    } catch (error) {
        console.error("getServiceRequestById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/status
// Provider updates request status
// ─────────────────────────────────────────────
async function updateRequestStatus(req, res) {
    try {
        const { status } = req.body;
        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });

        if (!provider) return res.status(404).json({ error: "Provider profile not found." });

        const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });

        if (!request) return res.status(404).json({ error: "Request not found." });
        if (request.providerId !== provider.id) return res.status(403).json({ error: "Unauthorized." });

        let paymentUpdate = {};
        if (status === "COMPLETED" && request.status !== "COMPLETED") {
            const amount = request.finalAmount || request.inspectionFee || 0;
            const commission = Number(amount) * 0.10;
            const earnings = Number(amount) * 0.90;

            if (request.paymentMethod === 'CASH') {
                await prisma.providerProfile.update({
                    where: { id: request.providerId },
                    data: {
                        walletBalance: { decrement: commission },
                        totalEarnings: { increment: earnings }
                    }
                });
                paymentUpdate = { paymentStatus: 'PAID' };
            }
        }

        const updated = await prisma.serviceRequest.update({
            where: { id: req.params.id },
            data: {
                status,
                ...paymentUpdate,
                ...(status === "COMPLETED" && { completedAt: new Date() }),
                ...(status === "CANCELLED" && { cancelledAt: new Date() }),
            },
        });

        // Notify customer
        await prisma.notification.create({
            data: {
                userId: request.customerId,
                type: "SERVICE_REQUEST_UPDATED",
                title: "Service Request Updated",
                message: `Your service request status changed to ${status.replace(/_/g, " ")}.`,
                link: `/service-requests/${request.id}`,
            },
        });

        res.json({ message: "Status updated.", request: updated });
    } catch (error) {
        console.error("updateRequestStatus:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// POST /api/service-requests/:id/inspection
// Provider requests an inspection
// ─────────────────────────────────────────────
async function requestInspection(req, res) {
    try {
        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(404).json({ error: "Provider not found." });

        const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
        if (!serviceRequest) return res.status(404).json({ error: "Service request not found." });
        if (serviceRequest.providerId !== provider.id) return res.status(403).json({ error: "Unauthorized." });

        const existing = await prisma.inspection.findUnique({ where: { serviceRequestId: req.params.id } });
        if (existing) return res.status(409).json({ error: "Inspection already requested." });

        const [inspection] = await prisma.$transaction([
            prisma.inspection.create({
                data: { serviceRequestId: req.params.id },
            }),
            prisma.serviceRequest.update({
                where: { id: req.params.id },
                data: { status: "INSPECTION_REQUESTED" },
            }),
        ]);

        await prisma.notification.create({
            data: {
                userId: serviceRequest.customerId,
                type: "INSPECTION_REQUESTED",
                title: "Inspection Requested",
                message: "Your provider has requested an on-site inspection.",
                link: `/service-requests/${req.params.id}`,
            },
        });

        res.status(201).json({ message: "Inspection requested.", inspection });
    } catch (error) {
        console.error("requestInspection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/inspection/schedule
// Provider schedules the inspection
// ─────────────────────────────────────────────
async function scheduleInspection(req, res) {
    try {
        const { scheduledDate, scheduledTime } = req.body;
        if (!scheduledDate || !scheduledTime) {
            return res.status(400).json({ error: "scheduledDate and scheduledTime are required." });
        }

        const [inspection] = await prisma.$transaction([
            prisma.inspection.upsert({
                where: { serviceRequestId: req.params.id },
                update: { scheduledDate: new Date(scheduledDate), scheduledTime, status: "SCHEDULED" },
                create: { serviceRequestId: req.params.id, scheduledDate: new Date(scheduledDate), scheduledTime, status: "SCHEDULED" },
            }),
            prisma.serviceRequest.update({
                where: { id: req.params.id },
                data: { status: "INSPECTION_SCHEDULED" },
            }),
        ]);

        res.json({ message: "Inspection scheduled.", inspection });
    } catch (error) {
        console.error("scheduleInspection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/inspection/complete
// Provider marks inspection as complete + adds diagnosis
// ─────────────────────────────────────────────
async function completeInspection(req, res) {
    try {
        const { diagnosis, providerNotes } = req.body;

        const [inspection] = await prisma.$transaction([
            prisma.inspection.update({
                where: { serviceRequestId: req.params.id },
                data: { status: "COMPLETED", diagnosis, providerNotes, completedAt: new Date() },
            }),
            prisma.serviceRequest.update({
                where: { id: req.params.id },
                data: { status: "INSPECTION_COMPLETED" },
            }),
        ]);

        res.json({ message: "Inspection completed.", inspection });
    } catch (error) {
        console.error("completeInspection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// POST /api/service-requests/:id/quote
// Provider creates/sends a quote
// ─────────────────────────────────────────────
async function createOrUpdateQuote(req, res) {
    try {
        const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
        if (!provider) return res.status(404).json({ error: "Provider not found." });

        const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
        if (!serviceRequest) return res.status(404).json({ error: "Service request not found." });
        if (serviceRequest.providerId !== provider.id) return res.status(403).json({ error: "Unauthorized." });

        const { diagnosis, labourCost, partsCost, inspectionCost, description, validUntil, send } = req.body;

        if (labourCost === undefined) return res.status(400).json({ error: "labourCost is required." });

        const labour = Number(labourCost);
        const parts = Number(partsCost || 0);
        const inspection = Number(inspectionCost || 0);
        const total = labour + parts + inspection;

        const quoteStatus = send ? "SENT" : "DRAFT";

        const quote = await prisma.serviceQuote.upsert({
            where: { serviceRequestId: req.params.id },
            create: {
                serviceRequestId: req.params.id,
                providerId: provider.id,
                diagnosis,
                labourCost: labour,
                partsCost: parts,
                inspectionCost: inspection,
                totalAmount: total,
                description,
                status: quoteStatus,
                validUntil: validUntil ? new Date(validUntil) : null,
            },
            update: {
                diagnosis,
                labourCost: labour,
                partsCost: parts,
                inspectionCost: inspection,
                totalAmount: total,
                description,
                status: quoteStatus,
                validUntil: validUntil ? new Date(validUntil) : null,
            },
        });

        if (send) {
            await prisma.serviceRequest.update({
                where: { id: req.params.id },
                data: { status: "QUOTE_SENT", finalAmount: total },
            });

            await prisma.notification.create({
                data: {
                    userId: serviceRequest.customerId,
                    type: "QUOTE_SUBMITTED",
                    title: "Quote Received",
                    message: `Your provider has sent a quote of Rs. ${total.toLocaleString()} for your service request.`,
                    link: `/service-requests/${req.params.id}`,
                },
            });
        }

        res.json({ message: send ? "Quote sent." : "Quote saved as draft.", quote });
    } catch (error) {
        console.error("createOrUpdateQuote:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/quote/respond
// Customer accepts or rejects a quote
// ─────────────────────────────────────────────
async function respondToQuote(req, res) {
    try {
        const { action } = req.body; // "ACCEPT" | "REJECT"

        if (!["ACCEPT", "REJECT"].includes(action)) {
            return res.status(400).json({ error: "action must be ACCEPT or REJECT." });
        }

        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: req.params.id },
            include: { quote: true, provider: true },
        });

        if (!serviceRequest) return res.status(404).json({ error: "Service request not found." });
        if (serviceRequest.customerId !== req.user.id) return res.status(403).json({ error: "Unauthorized." });
        if (!serviceRequest.quote || serviceRequest.quote.status !== "SENT") {
            return res.status(400).json({ error: "No pending quote to respond to." });
        }

        const quoteStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        const requestStatus = action === "ACCEPT" ? "QUOTE_ACCEPTED" : "QUOTE_REJECTED";

        await prisma.$transaction([
            prisma.serviceQuote.update({
                where: { serviceRequestId: req.params.id },
                data: { status: quoteStatus, respondedAt: new Date(), customerResponse: action },
            }),
            prisma.serviceRequest.update({
                where: { id: req.params.id },
                data: { status: requestStatus },
            }),
        ]);

        // Notify provider
        await prisma.notification.create({
            data: {
                userId: serviceRequest.provider.userId,
                type: action === "ACCEPT" ? "QUOTE_ACCEPTED" : "QUOTE_REJECTED",
                title: `Quote ${action === "ACCEPT" ? "Accepted" : "Rejected"}`,
                message: `Customer has ${action === "ACCEPT" ? "accepted" : "rejected"} your quote.`,
                link: `/provider/service-requests/${req.params.id}`,
            },
        });

        res.json({ message: `Quote ${quoteStatus.toLowerCase()}.` });
    } catch (error) {
        console.error("respondToQuote:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/confirm-completion
// Customer confirms service completed — triggers payment release
// ─────────────────────────────────────────────
async function confirmCompletion(req, res) {
    try {
        const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });

        if (!serviceRequest) return res.status(404).json({ error: "Service request not found." });
        if (serviceRequest.customerId !== req.user.id) return res.status(403).json({ error: "Unauthorized." });
        if (serviceRequest.paymentStatus !== "ESCROW_HELD") {
            return res.status(400).json({ error: "No held funds to release." });
        }

        await prisma.serviceRequest.update({
            where: { id: req.params.id },
            data: {
                paymentStatus: "RELEASED",
                status: "COMPLETED",
                customerConfirmedAt: new Date(),
                completedAt: new Date(),
            },
        });

        const amount = serviceRequest.escrowAmount || serviceRequest.finalAmount || serviceRequest.inspectionFee || 0;
        const earnings = Number(amount) * 0.90;

        await prisma.providerProfile.update({
            where: { id: serviceRequest.providerId },
            data: {
                walletBalance: { increment: earnings },
                totalEarnings: { increment: earnings }
            }
        });

        res.json({ success: true, message: "Payment released to provider." });
    } catch (error) {
        console.error("confirmCompletion:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/service-requests/:id/cancel
// Customer cancels their service request
// ─────────────────────────────────────────────
async function cancelRequest(req, res) {
    try {
        const { reason } = req.body;
        const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });

        if (!request) return res.status(404).json({ error: "Request not found." });
        if (request.customerId !== req.user.id) return res.status(403).json({ error: "Unauthorized." });

        const updated = await prisma.serviceRequest.update({
            where: { id: req.params.id },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancellationReason: reason,
            },
        });

        res.json({ message: "Request cancelled.", request: updated });
    } catch (error) {
        console.error("cancelRequest:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createServiceRequest,
    getCustomerRequests,
    getProviderRequests,
    getServiceRequestById,
    updateRequestStatus,
    requestInspection,
    scheduleInspection,
    completeInspection,
    createOrUpdateQuote,
    respondToQuote,
    confirmCompletion,
    cancelRequest,
};
