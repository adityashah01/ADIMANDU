const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { submitQuote, respondToQuote } = require("../controllers/quoteController");

router.post("/:bookingId", requireAuth, submitQuote);
router.patch("/:bookingId/respond", requireAuth, respondToQuote);

module.exports = router;
