module.exports = (otp, userName) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
      
      <!-- Header -->
      <div style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Kultur Tonight</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #333; font-weight: 600; margin-top: 0;">Hello ${userName},</h2>
        
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Thank you for signing up with <strong>Kultur Tonight</strong>.<br/>
          To complete your verification, please use the One-Time Password (OTP) below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 3px; background: #f1f5ff; padding: 15px 25px; border-radius: 6px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          🔒 This code is valid for <strong>5 minutes</strong>.  
          For your security, please do not share this code with anyone.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9f9f9; text-align: center; padding: 15px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #888;">
        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Kultur Tonight. All rights reserved.</p>
        <p style="margin: 5px 0;">
          <a href="https://kulturtonight.com" style="color: #007bff; text-decoration: none;">Visit our website</a>
        </p>
      </div>
    </div>
  </div>
`
