const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Wrap in an async IIFE so we can use await.
const sendMail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
    from: process.env.EMAIL, // sender address
    to, 
    subject, 
    text, 
  });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
    }
};

module.exports = sendMail;