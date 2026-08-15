const express = require("express");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

const {
    getPendingApplications,
    approveApplication,
    rejectApplication,
    getAllUsers,
    getAllBookings,
    getDashboardStats,
    getPlatformEarnings,
} = require("../controllers/adminController");

router.use(requireAuth);
router.use(requireAdmin);

router.get("/dashboard", getDashboardStats);

router.get("/applications", getPendingApplications);

router.patch("/applications/:id/approve", approveApplication);

router.patch("/applications/:id/reject", rejectApplication);

router.get("/users", getAllUsers);

router.get("/bookings", getAllBookings);

router.get("/earnings", getPlatformEarnings);

module.exports = router;