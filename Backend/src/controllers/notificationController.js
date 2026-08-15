const prisma = require("../lib/prisma");

// =========================================
// Create Notification (Internal Function)
// =========================================
async function createNotification(
    userId,
    type,
    title,
    message,
    link = null
) {
    return await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            link,
        },
    });
}

// =========================================
// Get All Notifications
// =========================================
async function getNotifications(req, res) {
    try {

        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(notifications);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });

    }
}

// =========================================
// Mark One Notification as Read
// =========================================
async function markAsRead(req, res) {

    try {

        const notification = await prisma.notification.update({

            where: {
                id: req.params.id,
            },

            data: {
                isRead: true,
            },

        });

        return res.json({
            message: "Notification marked as read.",
            notification,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });

    }
}

// =========================================
// Mark All Notifications as Read
// =========================================
async function markAllAsRead(req, res) {

    try {

        await prisma.notification.updateMany({

            where: {
                userId: req.user.id,
                isRead: false,
            },

            data: {
                isRead: true,
            },

        });

        return res.json({
            message: "All notifications marked as read.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });

    }
}

// =========================================
// Delete Notification
// =========================================
async function deleteNotification(req, res) {

    try {

        await prisma.notification.delete({

            where: {
                id: req.params.id,
            },

        });

        return res.json({
            message: "Notification deleted.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });

    }
}

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};