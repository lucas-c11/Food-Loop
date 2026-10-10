const express = require("express");
const Donation = require("../models/Donation");

const router = express.Router();

// Get all donations
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



// get donations from one restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
    try {
        const donations = await Donation.find({
            restaurantId: req.params.restuarantId
        })
            .populate("restaurantId")
            .populate("pantryId")
        res.json(donations);
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

// get donations from one pantry
router.get("/pantry/:pantryId", async (req, res) => {
    try {
        const donations = await Donation.find({
            pantryId: req.params.pantryId
        })
            .populate("restaurantId")
            .populate("pantryId")
        res.json(donations);
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

// Get available food to pickup
router.get("/available", async (req, res) => {
    try{
        const donations = await Donation.find({
            status: "available"
        })
            .populate("restaurantId")
        res.json(donations);
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
});

// Claim a donation
router.patch("/:id/claim", async (req, res) => {
    try {
        const donation = await Donation.findOneAndUpdate(
            {
                _id: req.params.id,
                status: "available"
            },
            {
                pantryId: pantryId,
                status: "claimed"
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!donation) {
            return res.status(404).json({
                message: "Donation not fount or already claimed"
            })
        }

        res.json(donation);
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
})

// Complete a donation
router.patch("/:id/complete", async (req, res) => {
    try {
        const donation = await Donation
        if (!donation) {
            const existingDonation = await Donation.findById(req.params.id);
            if (!existingDonation) {
                return res.status(404).json({
                    message: "Donation not found"
                })
            }

            return res.status(409).json({
                message: existingDonation.status === "done"
                    ? "Donation already completed"
                    : "Donation has not been claimed yet"
            })
            
        }
        res.json(donation);
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
})

// Make a donation
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

// update a donation
router.patch("/:id", async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }
        res.json(donation);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

// delete a donation
router.delete("/:id", async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(
            req.params.id
        );

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }

        res.json({
            message: "Donation deleted"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Get one donation
router.get("/:id", async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate("restaurantId")
            .populate("pantryId");
        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }
        res.json(donation);
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
});
module.exports = router;