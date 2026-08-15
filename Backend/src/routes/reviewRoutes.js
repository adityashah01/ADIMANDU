const express = require("express");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

const {
    createReview,
    updateReview,
    deleteReview,
    replyToReview,
    getProviderReviews,
} = require("../controllers/reviewController");

router.post(
    "/booking/:bookingId",
    requireAuth,
    createReview
);

router.put(
    "/:id",
    requireAuth,
    updateReview
);

router.delete(
    "/:id",
    requireAuth,
    deleteReview
);

router.patch(
    "/:id/reply",
    requireAuth,
    replyToReview
);

router.get(
    "/provider/:providerId",
    getProviderReviews
);

module.exports = router;