const express = require("express");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        res.json(restaurants);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);

        res.status(201).json(restaurant);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.json(restaurant);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.json(restaurant);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(
            req.params.id
        );

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.json({
            message: "Restaurant deleted"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


module.exports = router;