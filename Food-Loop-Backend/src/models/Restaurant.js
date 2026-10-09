const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    { _id: false }
)

const addressSchema = new mongoose.Schema(
    {
        line1: {
            type: String,
            required: true
        },

        line2: String,
        line3: String,

        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    { _id: false }
)

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        address: {
            type: addressSchema,
            required: true
        },

        contacts: {
            type: [contactSchema],
            default: []
        },

        manager: contactSchema,

        foodItems: {
            type: [String],
            default: []
        },

        einCertifications: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Restaurant", restaurantSchema);