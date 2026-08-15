const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
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
} = require("../controllers/serviceRequestController");

// All routes require authentication
router.use(requireAuth);

router.post("/", createServiceRequest);
router.get("/customer", getCustomerRequests);
router.get("/provider", getProviderRequests);
router.get("/:id", getServiceRequestById);

// Status
router.patch("/:id/status", updateRequestStatus);

// Inspection
router.post("/:id/inspection", requestInspection);
router.patch("/:id/inspection/schedule", scheduleInspection);
router.patch("/:id/inspection/complete", completeInspection);

// Quote
router.post("/:id/quote", createOrUpdateQuote);
router.patch("/:id/quote/respond", respondToQuote);

// Customer confirmation
router.patch("/:id/confirm-completion", confirmCompletion);

// Customer cancel
router.patch("/:id/cancel", cancelRequest);

module.exports = router;
