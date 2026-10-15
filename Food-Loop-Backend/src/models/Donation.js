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
            name: { type: String, required: true, trim: true, minlength: 1 },
            ingredients: { type: [String], default: [] },
            amount: {
                type: Number,
                required: true,
                validate: { validator: (value) => Number.isFinite(value) && value > 0, message: "amount must be greater than zero" }
            },
            picture: { type: String, default: null, trim: true }
        },
        status: {
            type: String,
            enum: ["available", "claimed", "done", "cancelled"],
            default: "available"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
