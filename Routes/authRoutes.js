const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmailOtp,
  login,
  forgotPassword,
  resetPassword,
} = require("../Controller/authController");

const authMiddleware = require("../Middleware/authMiddleware");

// ===============================
// AUTH ROUTES
// ===============================
router.post("/register", register);
router.post("/verify-email", verifyEmailOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ===============================
// PROTECTED ROUTE EXAMPLE
// ===============================
// router.get("/me", authMiddleware, (req, res) => {
//   res.json({ message: "Protected route", user: req.user });
// });

module.exports = router;
