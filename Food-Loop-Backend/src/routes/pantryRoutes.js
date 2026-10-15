const express = require("express");
const mongoose = require("mongoose");
const Pantry = require("../models/Pantry");
const { sendError, validateObjectBody } = require("../utils/apiResponse");

const router = express.Router();
const fields = ["name", "address", "contacts", "foodItems", "certification"];
const validId = (id) => mongoose.isValidObjectId(id);
const ownerId = (req) => req.auth.pantryId;

router.get("/", async (req, res) => {
    try {
        const pantry = await Pantry.findById(ownerId(req));
        res.json(pantry ? [pantry] : []);
    } catch (error) { sendError(res, error); }
});
router.post("/", (req, res) => res.status(403).json({ message: "Create an account through /api/auth/register" }));

router.get("/:id", async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid pantry id" });
    if (String(req.params.id) !== String(ownerId(req))) return res.status(404).json({ message: "Pantry not found" });
    try {
        const pantry = await Pantry.findById(ownerId(req));
        if (!pantry) return res.status(404).json({ message: "Pantry not found" });
        res.json(pantry);
    } catch (error) { sendError(res, error); }
});

router.patch("/:id", async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid pantry id" });
    if (String(req.params.id) !== String(ownerId(req))) return res.status(404).json({ message: "Pantry not found" });
    const message = validateObjectBody(req.body, fields);
    if (message) return res.status(400).json({ message });
    try {
        const pantry = await Pantry.findByIdAndUpdate(ownerId(req), req.body, { new: true, runValidators: true });
        if (!pantry) return res.status(404).json({ message: "Pantry not found" });
        res.json(pantry);
    } catch (error) { sendError(res, error); }
});
router.delete("/:id", (req, res) => res.status(409).json({ message: "Organization accounts cannot be deleted yet" }));
module.exports = router;
