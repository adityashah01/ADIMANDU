const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;