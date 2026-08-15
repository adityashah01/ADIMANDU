module.exports = function requireAdmin(req, res, next) {

    if (!req.user) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "Access denied. Admin only.",
        });
    }

    next();
};