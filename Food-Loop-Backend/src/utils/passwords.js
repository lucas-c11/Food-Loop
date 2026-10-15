const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(scryptCallback);
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;

async function hashPassword(password) {
    const salt = randomBytes(16);
    const derived = await scrypt(password, salt, KEY_LENGTH, {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: 128 * 1024 * 1024,
    });
    return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function verifyPassword(password, encoded) {
    const [algorithm, cost, blockSize, parallelization, saltText, keyText] = encoded.split("$");
    if (algorithm !== "scrypt" || Number(cost) !== COST || Number(blockSize) !== BLOCK_SIZE || Number(parallelization) !== PARALLELIZATION) {
        return false;
    }

    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(keyText, "base64url");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;

    const actual = await scrypt(password, salt, KEY_LENGTH, {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: 128 * 1024 * 1024,
    });
    return timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, verifyPassword };
