const User = require("../models/User");
const { getSecret, verifyAccessToken } = require("../utils/tokens");

async function requireAuth(req, res, next) {
    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ message: "Sign in to continue" });

    try {
        getSecret();
        const token = verifyAccessToken(match[1]);
        const user = await User.findById(token.sub).select("email role restaurantId pantryId").lean();
        if (!user) return res.status(401).json({ message: "Account no longer exists" });
        req.auth = user;
        next();
    } catch (error) {
        if (error.status === 503) return res.status(503).json({ message: error.message });
        return res.status(401).json({ message: "Session expired. Sign in again." });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.auth || !roles.includes(req.auth.role)) {
            return res.status(403).json({ message: "Your account cannot perform this action" });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
