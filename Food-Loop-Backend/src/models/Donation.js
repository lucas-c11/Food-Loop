const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        pantryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pantry",
            default: null
        },

        foodItem: {
            name: {
                type: String,
                required: true
            },

            ingredients: {
                type: [String],
                default: []
            },

            amount: {
                type: Number,
                required: true
            },

            picture: {
                type: String,
                default: null
            }
        },

        status: {
            type: String,
            enum: ["available", "claimed", "done"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Donation", donationSchema);