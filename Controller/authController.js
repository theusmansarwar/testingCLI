const User = require("../Models/AuthModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 const {
  sendEmail,
  registrationTemplate,
  verificationOtpTemplate,
  forgotPasswordTemplate
} = require("../Controller/emailverification");


// Generate 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ============================================================
   REGISTER USER
============================================================ */
const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    companyName,
    country,
    phone,
    fleetSize
  } = req.body;

  const missingFields = [];

  if (!firstName) missingFields.push({ name: "firstName", message: "First name is required" });
  if (!lastName) missingFields.push({ name: "lastName", message: "Last name is required" });
  if (!email) missingFields.push({ name: "email", message: "Email is required" });
  else if (!email.includes("@")) missingFields.push({ name: "email", message: "Invalid email format" });

  if (!password) missingFields.push({ name: "password", message: "Password is required" });

  if (!companyName) missingFields.push({ name: "companyName", message: "Company name is required" });
  if (!country) missingFields.push({ name: "country", message: "Country is required" });
  if (!phone) missingFields.push({ name: "phone", message: "Phone number is required" });
  if (!fleetSize) missingFields.push({ name: "fleetSize", message: "Fleet size is required" });

  // Return missing fields
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing or invalid!",
      missingFields,
    });
  }

  try {
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "Email already exists" }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      oldpassword: hashedPassword,
      companyName,
      country,
      phone,
      fleetSize,
      otp,               // store OTP for email verification
      isVerified: false, // default false
    });

    // TODO — SEND EMAIL OTP HERE (SMTP, SendGrid, etc.)
    await sendEmail(
  email,
  "Welcome to LimoTaxi – Verify Your Email",
  registrationTemplate(firstName) + verificationOtpTemplate(otp)
);

    
    res.status(201).json({
      status: 201,
      message: "Registration successful. Please verify your email via OTP.",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/* ============================================================
   VERIFY EMAIL OTP
============================================================ */
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  const missingFields = [];
  if (!email) missingFields.push({ name: "email", message: "Email is required" });
  if (!otp) missingFields.push({ name: "otp", message: "OTP is required" });

  if (missingFields.length > 0)
    return res.status(400).json({ status: 400, missingFields });

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });

  if (user.otp !== otp)
    return res.status(400).json({
      status: 400,
      message: "Invalid OTP",
      missingFields: [{ name: "otp", message: "Incorrect OTP" }],
    });

  user.isVerified = true;
  user.otp = null;
  await user.save();

  res.status(200).json({
    status: 200,
    message: "Email verified successfully",
  });
};

/* ============================================================
   LOGIN (ONLY IF VERIFIED)
============================================================ */
const login = async (req, res) => {
  const { email, password } = req.body;

  const missingFields = [];
  if (!email) missingFields.push({ name: "email", message: "Email is required" });
  if (!password) missingFields.push({ name: "password", message: "Password is required" });

  if (missingFields.length > 0)
    return res.status(400).json({ status: 400, missingFields });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });

    if (!user.isVerified)
      return res.status(400).json({
        status: 400,
        message: "Email not verified",
        missingFields: [{ name: "email", message: "Please verify your email" }],
      });

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword)
      return res.status(400).json({
        status: 400,
        message: "Incorrect password",
        missingFields: [{ name: "password", message: "Incorrect password" }],
      });

    const token = user.generateToken();

    res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      data: user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/* ============================================================
   FORGOT PASSWORD — SEND OTP
============================================================ */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const missingFields = [];
  if (!email) missingFields.push({ name: "email", message: "Email is required" });

  if (missingFields.length > 0)
    return res.status(400).json({ status: 400, missingFields });

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });

  const otp = generateOtp();

  user.otp = otp;
  await user.save();

  // TODO — SEND EMAIL OTP HERE
   await sendEmail(
  email,
  "Welcome to LimoTaxi – Verify Your Email",
  forgotPasswordTemplate(otp)
);

  res.status(200).json({
    status: 200,
    message: "OTP sent to email",
  });
};

/* ============================================================
   RESET PASSWORD USING OTP
============================================================ */
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const missingFields = [];
  if (!email) missingFields.push({ name: "email", message: "Email is required" });
  if (!otp) missingFields.push({ name: "otp", message: "OTP is required" });
  if (!newPassword) missingFields.push({ name: "newPassword", message: "New password is required" });

  if (missingFields.length > 0)
    return res.status(400).json({ status: 400, missingFields });

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });

  if (user.otp !== otp)
    return res.status(400).json({
      status: 400,
      message: "Invalid OTP",
      missingFields: [{ name: "otp", message: "Incorrect OTP" }],
    });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.oldpassword = user.password;
  user.password = hashedPassword;
  
  user.otp = null;
  await user.save();

  res.status(200).json({
    status: 200,
    message: "Password reset successfully",
  });
};

module.exports = {
  register,
  verifyEmailOtp,
  login,
  forgotPassword,
  resetPassword,
};
