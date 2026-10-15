const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error("Origin is not allowed by CORS"), { status: 403 }));
} }));
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
const authRoutes = require("./routes/authRoutes");
const { requireAuth, requireRole } = require("./middleware/auth");

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", requireAuth, requireRole("restaurant"), restaurantRoutes);
app.use("/api/pantries", requireAuth, requireRole("pantry"), pantryRoutes);
app.use("/api/donations", requireAuth, donationRoutes);
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
        ? error.status
        : 500;
    res.status(status).json({
        message: status < 500 ? error.message : "An unexpected server error occurred"
    });
});
