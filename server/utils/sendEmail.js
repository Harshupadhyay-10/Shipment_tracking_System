const nodemailer = require("nodemailer");
const dns = require("dns");

let cachedIp = null;

async function getGmailIPv4() {
  if (cachedIp) return cachedIp;
  const addresses = await dns.promises.resolve4("smtp.gmail.com");
  cachedIp = addresses[0];
  return cachedIp;
}

async function sendEmail({ to, subject, html }) {
  try {
    const ip = await getGmailIPv4();

    const transporter = nodemailer.createTransport({
      host: ip,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        servername: "smtp.gmail.com", // keeps TLS certificate validation correct even though we connect via raw IP
      },
      connectionTimeout: 10000,
    });

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