const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

const {
    createBooking,
    getBookedSlots,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    customerConfirmCompletion,
    updatePaymentStatus
} = require("../controllers/bookingController");

router.post("/", requireAuth, createBooking);

router.get("/customer", requireAuth, getCustomerBookings);

router.get("/provider", requireAuth, getProviderBookings);

router.get("/provider/:providerId/booked-slots", getBookedSlots);

router.get("/:id", requireAuth, getBookingById);

router.patch("/:id/status", requireAuth, updateBookingStatus);

router.patch("/:id/cancel", requireAuth, cancelBooking);

router.patch("/:id/customer-complete", requireAuth, customerConfirmCompletion);

router.patch("/:id/payment-status", requireAuth, updatePaymentStatus);

module.exports = router;