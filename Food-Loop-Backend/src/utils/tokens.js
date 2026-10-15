const { createHmac, timingSafeEqual } = require("crypto");

const ISSUER = "foodloop-api";
const HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
        const error = new Error("Authentication is not configured. Set JWT_SECRET to a random value of at least 32 characters.");
        error.status = 503;
        throw error;
    }
    return secret;
}

function signAccessToken(userId) {
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ sub: String(userId), iss: ISSUER, iat: now, exp: now + 60 * 60 * 12 })).toString("base64url");
    const unsigned = `${HEADER}.${payload}`;
    const signature = createHmac("sha256", getSecret()).update(unsigned).digest("base64url");
    return `${unsigned}.${signature}`;
}

function verifyAccessToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== HEADER) throw new Error("Invalid access token");

    const unsigned = `${parts[0]}.${parts[1]}`;
    const expected = createHmac("sha256", getSecret()).update(unsigned).digest();
    const actual = Buffer.from(parts[2], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Invalid access token");

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== ISSUER || typeof payload.sub !== "string" || !Number.isInteger(payload.exp) || payload.exp <= now) {
        throw new Error("Invalid or expired access token");
    }
    return payload;
}

module.exports = { getSecret, signAccessToken, verifyAccessToken };
