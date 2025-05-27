require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Missing email configuration. Please check your .env file.');
  throw new Error('Email configuration is incomplete');
}

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token, type = 'verification') => {
  try {
    console.log('=== SENDING VERIFICATION EMAIL ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);

    const verificationUrl = type === 'verification' 
      ? `https://bitealert-yzau.onrender.com/verify-email/${token}`
      : `https://bitealert-yzau.onrender.com/reset-password?token=${token}`;
    
    console.log('Verification URL:', verificationUrl);

    const mailOptions = {
      from: {
        name: 'Bite Alert',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: type === 'verification' ? 'Bite Alert - Email Verification' : 'Bite Alert - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #7D0C0C; margin: 0; font-size: 24px;">Bite Alert</h1>
            <p style="color: #666666; margin: 5px 0;">Your Health Companion</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
              ${type === 'verification' 
                ? 'Thank you for registering with Bite Alert. To complete your registration, please verify your email address by clicking the button below:'
                : 'We received a request to reset your password. To proceed with the password reset, please click the button below:'}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #7D0C0C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${type === 'verification' ? 'Verify Email Address' : 'Reset Password'}
            </a>
          </div>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
              ${type === 'verification' 
                ? 'If you did not create an account with Bite Alert, please ignore this email.'
                : 'If you did not request a password reset, please ignore this email and ensure your account is secure.'}
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #999999; text-align: center; margin: 0;">
              This is an automated message, please do not reply to this email.<br>
              © ${new Date().getFullYear()} Bite Alert. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('=== EMAIL SENDING ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    throw new Error('Failed to send verification email: ' + error.message);
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail
}; 
