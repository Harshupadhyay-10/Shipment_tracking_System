const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  family: 4, // force IPv4, avoids the IPv6 timeout issue some cloud hosts hit with Gmail
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"Go Between India Logistics" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

module.exports = sendEmail;