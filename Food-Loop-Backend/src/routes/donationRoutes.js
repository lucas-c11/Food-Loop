const express = require("express");
const Donation = require("../models/Donation");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const donations = await Donation
            .find()
            .populate("restaurantId")
            .populate("pantryId");

        res.json(donations);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const donation = await Donation.create(req.body);

        res.status(201).json(donation);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

module.exports = router;