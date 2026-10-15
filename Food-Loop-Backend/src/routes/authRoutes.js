const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Pantry = require("../models/Pantry");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const { getSecret, signAccessToken } = require("../utils/tokens");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function badRequest(message) {
    return { message };
}

function validateRegistration(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be a JSON object";
    const allowed = ["role", "name", "email", "password", "address"];
    const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
    if (unknown.length) return `Unsupported field(s): ${unknown.join(", ")}`;
    if (!["restaurant", "store", "pantry"].includes(body.role)) return "Choose restaurant, store, or pantry";
    if (typeof body.name !== "string" || !body.name.trim()) return "Organization name is required";
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return "Enter a valid email address";
    if (typeof body.password !== "string" || body.password.length < 8) return "Password must be at least 8 characters";
    if (Buffer.byteLength(body.password, "utf8") > 72) return "Password must be 72 bytes or fewer";
    if (!body.address || typeof body.address !== "object" || Array.isArray(body.address)) return "Organization address is required";
    const addressFields = ["line1", "line2", "line3", "city", "state", "postalCode"];
    const unknownAddressFields = Object.keys(body.address).filter((key) => !addressFields.includes(key));
    if (unknownAddressFields.length) return `Unsupported address field(s): ${unknownAddressFields.join(", ")}`;
    for (const field of ["line1", "city", "state", "postalCode"]) {
        if (typeof body.address[field] !== "string" || !body.address[field].trim()) return `Address ${field} is required`;
    }
    return null;
}

async function accountResponse(user) {
    const role = user.role;
    const organization = role === "pantry"
        ? await Pantry.findById(user.pantryId)
        : await Restaurant.findById(user.restaurantId);
    if (!organization) throw new Error("Account organization was not found");
    return {
        token: signAccessToken(user._id),
        user: {
            id: String(user._id),
            email: user.email,
            role,
            organization,
        },
    };
}

router.post("/register", async (req, res) => {
    const validationError = validateRegistration(req.body);
    if (validationError) return res.status(400).json(badRequest(validationError));

    try {
        getSecret();
        const email = req.body.email.trim().toLowerCase();
        if (await User.exists({ email })) return res.status(409).json({ message: "An account with this email already exists" });

        const role = req.body.role === "pantry" ? "pantry" : "restaurant";
        const Organization = role === "pantry" ? Pantry : Restaurant;
        const organization = await Organization.create({
            name: req.body.name.trim(),
            address: req.body.address,
            contacts: [],
            foodItems: [],
            ...(role === "pantry" ? { certification: false } : {}),
        });

        try {
            const user = await User.create({
                email,
                passwordHash: await hashPassword(req.body.password),
                role,
                ...(role === "pantry" ? { pantryId: organization._id } : { restaurantId: organization._id }),
            });
            return res.status(201).json(await accountResponse(user));
        } catch (error) {
            await Organization.deleteOne({ _id: organization._id });
            if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists" });
            throw error;
        }
    } catch (error) {
        if (error.status === 503) return res.status(503).json({ message: error.message });
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Could not create the account" });
    }
});

router.post("/login", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    try {
        getSecret();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }
        return res.json(await accountResponse(user));
    } catch (error) {
        if (error.status === 503) return res.status(503).json({ message: error.message });
        return res.status(500).json({ message: "Could not sign in right now" });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.auth._id || req.auth.id);
        if (!user) return res.status(401).json({ message: "Account no longer exists" });
        return res.json(await accountResponse(user));
    } catch {
        return res.status(500).json({ message: "Could not load the account" });
    }
});

module.exports = router;
