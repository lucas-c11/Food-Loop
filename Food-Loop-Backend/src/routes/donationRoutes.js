const express = require("express");
const mongoose = require("mongoose");
const Donation = require("../models/Donation");
const Pantry = require("../models/Pantry");
const Restaurant = require("../models/Restaurant");
const { sendError, isPlainObject } = require("../utils/apiResponse");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const validId = (value) => mongoose.isValidObjectId(value);
const invalidId = (res, field = "id") => res.status(400).json({ message: `Invalid ${field}` });

function validateDonationInput(body) {
    if (!isPlainObject(body)) return "Request body must be a JSON object";

    const unknownFields = Object.keys(body).filter((key) => key !== "foodItem");
    if (unknownFields.length) return `Unsupported field(s): ${unknownFields.join(", ")}`;
    if (!isPlainObject(body.foodItem)) return "foodItem must be an object";

    const allowedFoodFields = ["name", "ingredients", "amount", "picture"];
    const unknownFoodFields = Object.keys(body.foodItem).filter((key) => !allowedFoodFields.includes(key));
    if (unknownFoodFields.length) return `Unsupported foodItem field(s): ${unknownFoodFields.join(", ")}`;
    if (typeof body.foodItem.name !== "string" || !body.foodItem.name.trim()) return "foodItem.name is required";
    if (typeof body.foodItem.amount !== "number" || !Number.isFinite(body.foodItem.amount) || body.foodItem.amount <= 0) {
        return "foodItem.amount must be a number greater than zero";
    }
    if (body.foodItem.ingredients !== undefined
        && (!Array.isArray(body.foodItem.ingredients) || !body.foodItem.ingredients.every((item) => typeof item === "string"))) {
        return "foodItem.ingredients must be an array of strings";
    }
    if (body.foodItem.picture !== undefined && body.foodItem.picture !== null && typeof body.foodItem.picture !== "string") {
        return "foodItem.picture must be a string or null";
    }
    return null;
}

function validateFoodItemPatch(body) {
    if (!isPlainObject(body)) return "Request body must be a JSON object";
    const keys = Object.keys(body);
    if (keys.length !== 1 || keys[0] !== "foodItem") {
        return "Only foodItem can be edited here; use claim and complete actions to change donation status";
    }
    if (!isPlainObject(body.foodItem)) return "foodItem must be an object";
    const allowed = ["name", "ingredients", "amount", "picture"];
    const unknown = Object.keys(body.foodItem).filter((key) => !allowed.includes(key));
    if (unknown.length) return `Unsupported foodItem field(s): ${unknown.join(", ")}`;
    if (body.foodItem.name !== undefined && (typeof body.foodItem.name !== "string" || !body.foodItem.name.trim())) {
        return "foodItem.name must not be blank";
    }
    if (body.foodItem.amount !== undefined
        && (typeof body.foodItem.amount !== "number" || !Number.isFinite(body.foodItem.amount) || body.foodItem.amount <= 0)) {
        return "foodItem.amount must be a number greater than zero";
    }
    if (body.foodItem.ingredients !== undefined
        && (!Array.isArray(body.foodItem.ingredients) || !body.foodItem.ingredients.every((item) => typeof item === "string"))) {
        return "foodItem.ingredients must be an array of strings";
    }
    if (body.foodItem.picture !== undefined && body.foodItem.picture !== null && typeof body.foodItem.picture !== "string") {
        return "foodItem.picture must be a string or null";
    }
    if (!Object.keys(body.foodItem).length) return "Provide at least one foodItem field to update";
    return null;
}

async function loadDonationFailure(id, expectedStatus, res, action, ownerFilter = {}) {
    const existing = await Donation.findOne({ _id: id, ...ownerFilter });
    if (!existing) return res.status(404).json({ message: "Donation not found" });
    if (action === "completed" && existing.status === "done") {
        return res.status(409).json({ message: "Donation already completed" });
    }
    return res.status(409).json({
        message: expectedStatus === "available"
            ? `Only available donations can be ${action}`
            : `Only claimed donations can be ${action}`
    });
}

// List every donation.
router.get("/", async (req, res) => {
    try {
        const filter = req.auth.role === "restaurant" ? { restaurantId: req.auth.restaurantId } : { pantryId: req.auth.pantryId };
        const donations = await Donation.find(filter).populate("restaurantId").populate("pantryId");
        res.json(donations);
    } catch (error) {
        sendError(res, error);
    }
});

// List donations posted by one restaurant.
router.get("/restaurant/:restaurantId", requireRole("restaurant"), async (req, res) => {
    if (!validId(req.params.restaurantId)) return invalidId(res, "restaurantId");
    if (String(req.params.restaurantId) !== String(req.auth.restaurantId)) return res.status(404).json({ message: "Restaurant not found" });
    try {
        const donations = await Donation.find({ restaurantId: req.params.restaurantId })
            .populate("restaurantId").populate("pantryId");
        res.json(donations);
    } catch (error) {
        sendError(res, error);
    }
});

// List donations assigned to one pantry, including completed history.
router.get("/pantry/:pantryId", requireRole("pantry"), async (req, res) => {
    if (!validId(req.params.pantryId)) return invalidId(res, "pantryId");
    if (String(req.params.pantryId) !== String(req.auth.pantryId)) return res.status(404).json({ message: "Pantry not found" });
    try {
        const donations = await Donation.find({ pantryId: req.params.pantryId })
            .populate("restaurantId").populate("pantryId");
        res.json(donations);
    } catch (error) {
        sendError(res, error);
    }
});

// List a pantry's active claims for its dashboard.
router.get("/pantry/:pantryId/active", requireRole("pantry"), async (req, res) => {
    if (!validId(req.params.pantryId)) return invalidId(res, "pantryId");
    if (String(req.params.pantryId) !== String(req.auth.pantryId)) return res.status(404).json({ message: "Pantry not found" });
    try {
        const donations = await Donation.find({ pantryId: req.params.pantryId, status: "claimed" })
            .populate("restaurantId").populate("pantryId");
        res.json(donations);
    } catch (error) {
        sendError(res, error);
    }
});

// List donations available to claim.
router.get("/available", requireRole("pantry"), async (req, res) => {
    try {
        const donations = await Donation.find({ status: "available" }).populate("restaurantId");
        res.json(donations);
    } catch (error) {
        sendError(res, error);
    }
});

// Claim an available donation for a pantry: available -> claimed.
router.patch("/:id/claim", requireRole("pantry"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const pantry = await Pantry.findById(req.auth.pantryId);
        if (!pantry) return res.status(404).json({ message: "Pantry not found" });

        const donation = await Donation.findOneAndUpdate(
            { _id: req.params.id, status: "available" },
            { pantryId: pantry._id, status: "claimed" },
            { new: true, runValidators: true }
        ).populate("restaurantId").populate("pantryId");
        if (!donation) return loadDonationFailure(req.params.id, "available", res, "claimed");
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

// Complete a claimed donation: claimed -> done.
router.patch("/:id/complete", requireRole("pantry"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const donation = await Donation.findOneAndUpdate(
            { _id: req.params.id, pantryId: req.auth.pantryId, status: "claimed" },
            { status: "done" },
            { new: true, runValidators: true }
        ).populate("restaurantId").populate("pantryId");
        if (!donation) return loadDonationFailure(req.params.id, "claimed", res, "completed", { pantryId: req.auth.pantryId });
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

// Release a claimed donation back to the available pool.
router.patch("/:id/release", requireRole("pantry"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const donation = await Donation.findOneAndUpdate(
            { _id: req.params.id, pantryId: req.auth.pantryId, status: "claimed" },
            { status: "available", pantryId: null },
            { new: true, runValidators: true }
        ).populate("restaurantId").populate("pantryId");
        if (!donation) return loadDonationFailure(req.params.id, "claimed", res, "released", { pantryId: req.auth.pantryId });
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

// Cancel an unclaimed donation while preserving its history.
router.patch("/:id/cancel", requireRole("restaurant"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const donation = await Donation.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.auth.restaurantId, status: "available" },
            { status: "cancelled" },
            { new: true, runValidators: true }
        ).populate("restaurantId");
        if (!donation) return loadDonationFailure(req.params.id, "available", res, "cancelled", { restaurantId: req.auth.restaurantId });
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});
// Create a donation. Status and pantry assignment are server-managed.
router.post("/", requireRole("restaurant"), async (req, res) => {
    const validationMessage = validateDonationInput(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });
    try {
        const restaurant = await Restaurant.findById(req.auth.restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        const donation = await Donation.create({
            restaurantId: restaurant._id,
            foodItem: req.body.foodItem,
            status: "available",
            pantryId: null
        });
        res.status(201).json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

// Edit food details only while a donation remains available.
router.patch("/:id", requireRole("restaurant"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    const validationMessage = validateFoodItemPatch(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });
    try {
        const donation = await Donation.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.auth.restaurantId, status: "available" },
            { $set: Object.fromEntries(Object.entries(req.body.foodItem).map(([key, value]) => [`foodItem.${key}`, value])) },
            { new: true, runValidators: true }
        ).populate("restaurantId").populate("pantryId");
        if (!donation) return loadDonationFailure(req.params.id, "available", res, "edited", { restaurantId: req.auth.restaurantId });
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

// Delete an available donation only; keep claimed/completed history intact.
router.delete("/:id", requireRole("restaurant"), async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const donation = await Donation.findOneAndDelete({ _id: req.params.id, restaurantId: req.auth.restaurantId, status: "available" });
        if (donation) return res.json({ message: "Donation deleted" });
        return loadDonationFailure(req.params.id, "available", res, "deleted", { restaurantId: req.auth.restaurantId });
    } catch (error) {
        sendError(res, error);
    }
});

// Get one donation.
router.get("/:id", async (req, res) => {
    if (!validId(req.params.id)) return invalidId(res, "donation id");
    try {
        const donation = await Donation.findById(req.params.id).populate("restaurantId").populate("pantryId");
        if (!donation) return res.status(404).json({ message: "Donation not found" });
        const canView = req.auth.role === "restaurant"
            ? String(donation.restaurantId?._id) === String(req.auth.restaurantId)
            : (donation.status === "available" || String(donation.pantryId?._id) === String(req.auth.pantryId));
        if (!canView) return res.status(404).json({ message: "Donation not found" });
        res.json(donation);
    } catch (error) {
        sendError(res, error);
    }
});

module.exports = router;
