const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const { sendError, validateObjectBody } = require("../utils/apiResponse");

const router = express.Router();
const fields = ["name", "address", "contacts", "manager", "foodItems", "einCertifications"];
const validId = (id) => mongoose.isValidObjectId(id);
const ownerId = (req) => req.auth.restaurantId;

router.get("/", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(ownerId(req));
        res.json(restaurant ? [restaurant] : []);
    } catch (error) { sendError(res, error); }
});

router.post("/", (req, res) => res.status(403).json({ message: "Create an account through /api/auth/register" }));

router.get("/:id", async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid restaurant id" });
    if (String(req.params.id) !== String(ownerId(req))) return res.status(404).json({ message: "Restaurant not found" });
    try {
        const restaurant = await Restaurant.findById(ownerId(req));
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        res.json(restaurant);
    } catch (error) { sendError(res, error); }
});

router.patch("/:id", async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid restaurant id" });
    if (String(req.params.id) !== String(ownerId(req))) return res.status(404).json({ message: "Restaurant not found" });
    const message = validateObjectBody(req.body, fields);
    if (message) return res.status(400).json({ message });
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(ownerId(req), req.body, { new: true, runValidators: true });
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        res.json(restaurant);
    } catch (error) { sendError(res, error); }
});

router.delete("/:id", (req, res) => res.status(409).json({ message: "Organization accounts cannot be deleted yet" }));
module.exports = router;
