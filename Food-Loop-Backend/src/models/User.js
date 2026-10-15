const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["restaurant", "pantry"], required: true },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: function () { return this.role === "restaurant"; }
    },
    pantryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pantry",
        required: function () { return this.role === "pantry"; }
    }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
