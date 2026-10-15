const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 1 },
    phone: { type: String, required: true, trim: true, minlength: 1 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
}, { _id: false });

const addressSchema = new mongoose.Schema({
    line1: { type: String, required: true, trim: true, minlength: 1 },
    line2: { type: String, trim: true },
    line3: { type: String, trim: true },
    city: { type: String, required: true, trim: true, minlength: 1 },
    state: { type: String, required: true, trim: true, minlength: 1 },
    postalCode: { type: String, required: true, trim: true, minlength: 1 }
}, { _id: false });

const pantrySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 1 },
    address: { type: addressSchema, required: true },
    contacts: { type: [contactSchema], default: [] },
    foodItems: { type: [String], default: [] },
    certification: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Pantry", pantrySchema);
