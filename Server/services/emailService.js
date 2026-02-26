const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
const emailTemplates = {
  // Email Verification Template
  verifyEmail: (name, verificationUrl) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #5a67d8; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: white;">Verify Email Address</a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Password Reset Template
  resetPassword: (name, resetUrl) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #e04055; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <div class="warning">
              <strong>Didn't request this?</strong><br>
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Password Changed Confirmation
  passwordChanged: (name) => ({
    subject: 'Your Password Has Been Changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your password has been successfully changed.</p>
            <p>If you made this change, no further action is required.</p>
            <div class="warning">
              <strong>Didn't make this change?</strong><br>
              If you didn't change your password, please contact our support team immediately as your account may be compromised.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
