const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "FoodLoop API is running!"
    });
});

const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

const restaurantRoutes = require("./routes/restaurantRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
const donationRoutes = require("./routes/donationRoutes");

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/pantries", pantryRoutes);
app.use("/api/donations", donationRoutes);