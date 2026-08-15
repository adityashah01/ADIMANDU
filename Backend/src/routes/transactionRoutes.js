const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
    getProviderTransactions,
    getBookingTransactions,
} = require("../controllers/transactionController");

router.use(requireAuth);

router.get("/provider", getProviderTransactions);
router.get("/booking/:bookingId", getBookingTransactions);

module.exports = router;
