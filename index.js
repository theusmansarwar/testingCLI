require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 5017;

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://admin.zemalt.com",
  "https://zemalt.com",
  "https://www.zemalt.com",
  "http://localhost:3001",
  "https://creators-time.blogspot.com",
  "https://creators-time.blogspot.com/",
  "https://plutosec.ca/",
  "https://ztesting.site",
  "https://limo.ztesting.site",
  "https://limo.ztesting.site/",
];

// ✅ Apply CORS Middleware Before Routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

// ✅ Handle Preflight Requests
app.options("*", cors());

// Middleware
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Routes
const authRoutes = require("./Routes/authRoutes");
app.use("/auth", authRoutes);

// Static folder (still allowed for old images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ❌ REMOVED multer
// ❌ REMOVED upload storage config
// ❌ REMOVED upload middleware
// ❌ REMOVED /upload-image API

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err);

  if (err.status === 413) {
    return res.status(413).json({
      status: 413,
      message:
        "Request entity too large! Please reduce file size or request payload.",
    });
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

// Start DB + Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
  });
});
