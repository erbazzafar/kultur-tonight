const dotenv = require("dotenv")
dotenv.config()

module.exports = (userName, referralCode) => `
  <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); padding: 30px;">
      
      <h2 style="color: #222; text-align: center;">Welcome to <span style="color:#007bff;">Kultur Tonight</span>, ${userName}! 🎉</h2>
      
      <p style="font-size: 16px; margin-top: 20px;">
        We're excited to have you join our community. With Kultur Tonight, you’ll always stay connected to the latest cultural events and experiences.
      </p>

      <p style="font-size: 16px; margin-top: 10px;">
        You also have your very own referral link! Share it with friends and start building your community:
      </p>

      <div style="margin: 20px 0; text-align: center;">
        <a href="${process.env.APP_DOMAIN}/${referralCode}" 
           style="display: inline-block; padding: 12px 25px; background: #007bff; color: #fff; text-decoration: none; font-size: 16px; border-radius: 6px; font-weight: bold;">
          Your Referral Link
        </a>
      </div>

      <p style="font-size: 15px; text-align: center; margin-top: 20px; color: #555;">
        ${process.env.APP_DOMAIN}/${referralCode}
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

      <p style="font-size: 14px; color: #555;">
        Cheers,<br/>
        <strong>The Kultur Tonight Team</strong>
      </p>
    </div>
  </div>
`
