const express = require("express");
const Pantry = require("../models/Pantry");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pantries = await Pantry.find();

        res.json(pantries);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const pantry = await Pantry.create(req.body);

        res.status(201).json(pantry);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const pantry = await Pantry.findById(req.params.id);

        if (!pantry) {
            return res.status(404).json({
                message: "Pantry not found"
            });
        }

        res.json(pantry);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const pantry = await Pantry.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!pantry) {
            return res.status(404).json({
                message: "Pantry not found"
            });
        }

        res.json(pantry);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const pantry = await Pantry.findByIdAndDelete(
            req.params.id
        );

        if (!pantry) {
            return res.status(404).json({
                message: "Pantry not found"
            });
        }

        res.json({
            message: "Pantry deleted"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


module.exports = router;