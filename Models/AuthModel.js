const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    oldpassword: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    fleetSize: {
      type: String,
      required: true,
    },
    isVerified: {
    type: Boolean, default: false 
    },
     otp: {
      type: String,
    },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function () {
  try {
    return jwt.sign(
      { userId: this._id, email: this.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
