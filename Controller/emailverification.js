const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------------
// SEND EMAIL FUNCTION
// -------------------------
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"LimoTaxi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

// -------------------------
// EMAIL TEMPLATES
// -------------------------

// 1️⃣ Registration Template
const registrationTemplate = (name) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Welcome to LimoTaxi, ${name}!</h2>
    <p>Thank you for registering on <strong>LimoTaxi</strong>.</p>
    <p>Please verify your email to complete your registration.</p>
    <p>We’re excited to have you onboard!</p>
  </div>
`;

// 2️⃣ Verification OTP Template
const verificationOtpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Your Email Verification Code</h2>
    <p>Your verification code is:</p>
    <h1 style="letter-spacing: 4px;">${otp}</h1>
    <p>This code will expire shortly.</p>
  </div>
`;

// 3️⃣ Forgot Password OTP Template
const forgotPasswordTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Password Reset Request</h2>
    <p>Your password reset OTP is:</p>
    <h1 style="letter-spacing: 4px;">${otp}</h1>
    <p>If you didn’t request this, simply ignore this email.</p>
  </div>
`;

module.exports = {
  sendEmail,
  registrationTemplate,
  verificationOtpTemplate,
  forgotPasswordTemplate,
};
