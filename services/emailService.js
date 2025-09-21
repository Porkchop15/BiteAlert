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

// Create a transporter using Gmail with enhanced configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  rateDelta: 20000,
  rateLimit: 5
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

// Send verification email with retry logic
const sendVerificationEmail = async (email, token, type = 'verification', retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  try {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    console.log('Attempt:', retryCount + 1);

    let mailOptions;
    
    if (type === 'verification') {
      // Email verification template for registration
      mailOptions = {
        from: {
          name: 'Bite Alert',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Bite Alert - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #7D0C0C; margin: 0; font-size: 24px;">Bite Alert</h1>
              <p style="color: #666666; margin: 5px 0;">Your Health Companion</p>
            </div>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
                Thank you for registering with Bite Alert. To complete your registration, please verify your email address by clicking the button below:
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bitealert-yzau.onrender.com/verify-email/${token}" 
                 style="background-color: #7D0C0C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
              <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
                If you did not create an account with Bite Alert, please ignore this email.
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
    } else if (type === 'password-reset') {
      // OTP template for password reset
      mailOptions = {
        from: {
          name: 'Bite Alert',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #7D0C0C; margin: 0; font-size: 24px;">Bite Alert</h1>
              <p style="color: #666666; margin: 5px 0;">Your Health Companion</p>
            </div>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
                You have requested to reset your password. Please use the following verification code:
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #7D0C0C; letter-spacing: 2px;">${token}</span>
              </div>
              <p style="font-size: 14px; color: #666666; margin: 0;">
                This code will expire in 5 minutes.
              </p>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
              <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
                If you did not request this password reset, please ignore this email.
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
    } else {
      throw new Error('Invalid email type');
    }

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('=== EMAIL SENDING ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    // Retry logic for connection timeouts
    if (retryCount < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
      console.log(`Retrying email send in ${retryDelay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return sendVerificationEmail(email, token, type, retryCount + 1);
    }
    
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail
}; 
