const express = require("express");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require("../controllers/notificationController");

router.get("/", requireAuth, getNotifications);

router.patch("/:id/read", requireAuth, markAsRead);

router.patch("/read-all", requireAuth, markAllAsRead);

router.delete("/:id", requireAuth, deleteNotification);

module.exports = router;