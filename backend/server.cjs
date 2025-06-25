const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Utility to load user list (optional - from employees.json)
const EMPLOYEES_FILE = path.join(__dirname, "../src/data/employees.json");

// POST route to send OTP
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Setup mail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
