const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL, // must be verified in SendGrid
        name: "K-T" // ✅ This will show as the sender name
      },
      subject,
      html,
    }

    await sgMail.send(msg)
    console.log("✅ Email sent successfully")
  } catch (error) {
    console.error("❌ Error sending email:", error)
    if (error.response) {
      console.error(error.response.body)
    }
  }
}

module.exports = sendEmail
