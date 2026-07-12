const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({
      from: "Go Between India Logistics <onboarding@resend.dev>",
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