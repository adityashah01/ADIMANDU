require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const catalogServiceRoutes = require("./routes/catalogServiceRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const providerServicesRoutes = require("./routes/providerServicesRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

/* =======================
        CORS
======================= */

// Allowed frontend origins
const allowedOrigins = [
    "https://sewa-center.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
];

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

/* =======================
      Middleware
======================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

/* =======================
        API Routes
======================= */

app.use("/api/auth", authRoutes);

app.use("/api/providers", providerRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/quotes", quoteRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/catalog-services", catalogServiceRoutes);

app.use("/api/service-requests", serviceRequestRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/provider-services", providerServicesRoutes);

app.use("/api/ai", aiRoutes);

/* =======================
       Health Check
======================= */

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: `Server is running successfully. Timestamp: ${new Date().toISOString()}`,
    });
});

/* =======================
        404 Handler & SPA Fallback
======================= */

const path = require("path");
const distPath = path.join(__dirname, "../../Frontend/dist");
app.use(express.static(distPath));

// For React Router fallback
app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

/* =======================
     Global Error Handler
======================= */

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

/* =======================
        Start Server
======================= */

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${ PORT } `);
});