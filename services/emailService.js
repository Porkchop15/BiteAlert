require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Platform:', process.platform);

// Use default email configuration if environment variables are not set
const emailUser = process.env.EMAIL_USER || 'bitealert.app@gmail.com';
const emailPassword = process.env.EMAIL_PASSWORD || 'your-app-password-here';

if (!emailUser || !emailPassword || emailPassword === 'your-app-password-here') {
  console.warn('⚠️ Email configuration is incomplete. Using fallback configuration.');
  console.warn('⚠️ Please set EMAIL_USER and EMAIL_PASSWORD environment variables for production use.');
}

// Create a transporter using Gmail with better configuration for cloud hosting
let transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} catch (transporterError) {
  console.error('Failed to create email transporter:', transporterError);
  transporter = null;
}

// Verify transporter configuration
if (transporter) {
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});
} else {
  console.warn('⚠️ Email transporter not available - email service disabled');
}

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token, type = 'verification') => {
  try {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);

    // Check if email configuration is available
    if (!emailUser || !emailPassword || emailPassword === 'your-app-password-here') {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      console.warn('⚠️ User registration will continue without email verification.');
      return true; // Return success to not block registration
    }

    // Check if transporter is available
    if (!transporter) {
      console.warn('⚠️ Email transporter not available. Skipping email send.');
      console.warn('⚠️ User registration will continue without email verification.');
      return true; // Return success to not block registration
    }

    // Use Nodemailer for email sending
    console.log('📧 Attempting to send email via Nodemailer...');

    let mailOptions;
    
    if (type === 'verification') {
      // Email verification template for registration
      mailOptions = {
        from: {
          name: 'Bite Alert',
          address: emailUser
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
          address: emailUser
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

    console.log('Sending email via Nodemailer...');
    console.log('Email details:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });
    
    // Add timeout wrapper for email sending
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000); // 30 second timeout
    });
    
    try {
      const info = await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Email sent successfully via Nodemailer:', info.messageId);
      console.log('📧 Email response:', info.response);
      return true;
    } catch (sendError) {
      console.error('❌ Nodemailer email sending failed:', sendError);
      console.error('Error details:', {
        code: sendError.code,
        command: sendError.command,
        message: sendError.message
      });
      throw sendError;
    }
  } catch (error) {
    console.error('=== EMAIL SENDING ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    // Don't throw error if email service is not configured
    if (!emailUser || !emailPassword || emailPassword === 'your-app-password-here') {
      console.warn('⚠️ Email service not configured. Registration will continue without email verification.');
      return true;
    }
    
    // Handle specific Nodemailer error types
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.warn('⚠️ Nodemailer connection timeout. This is common on cloud hosting platforms.');
      console.warn('⚠️ Will try alternative email services.');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Connection refused')) {
      console.warn('⚠️ Nodemailer connection refused. Check network/firewall settings.');
      console.warn('⚠️ Will try alternative email services.');
    } else if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
      console.warn('⚠️ Nodemailer authentication failed. Check EMAIL_USER and EMAIL_PASSWORD.');
      console.warn('⚠️ Will try alternative email services.');
    } else {
      console.warn('⚠️ Nodemailer sending failed for unknown reason. Will try alternative email services.');
    }
    
    return false;
  }
};

// Simple fallback email service
const sendEmailViaAPI = async (email, token, type = 'verification') => {
  try {
    console.log('=== ATTEMPTING FALLBACK EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    // Simple fallback - just log the verification details
    const verificationUrl = `https://bitealert-yzau.onrender.com/verify-email/${token}`;
    
    console.log('📧 FALLBACK EMAIL SERVICE:');
    if (type === 'verification') {
      console.log('📧 Verification email details:');
      console.log('🔗 Verification URL:', verificationUrl);
      console.log('📧 Email:', email);
      console.log('🔑 Token:', token);
      console.log('💡 User can click the link to verify their account');
    } else if (type === 'password-reset') {
      console.log('📧 Password reset email details:');
      console.log('🔑 OTP Code:', token);
      console.log('📧 Email:', email);
      console.log('💡 User can use the OTP to reset their password');
    }
    
    return true; // Return success to not block registration
    
  } catch (error) {
    console.error('❌ Fallback email service failed:', error);
    return false;
  }
};

// Simple HTTP email service (placeholder)
const sendEmailViaHTTP = async (email, token, type = 'verification') => {
  try {
    console.log('=== SIMPLE EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    // Simple fallback - just log the verification details
    const verificationUrl = `https://bitealert-yzau.onrender.com/verify-email/${token}`;
    
    console.log('📧 SIMPLE EMAIL SERVICE:');
    if (type === 'verification') {
      console.log('📧 Verification email details:');
      console.log('🔗 Verification URL:', verificationUrl);
      console.log('📧 Email:', email);
      console.log('🔑 Token:', token);
      console.log('💡 User can click the link to verify their account');
    } else if (type === 'password-reset') {
      console.log('📧 Password reset email details:');
      console.log('🔑 OTP Code:', token);
      console.log('📧 Email:', email);
      console.log('💡 User can use the OTP to reset their password');
    }
    
    return true; // Return success to not block registration
    
  } catch (error) {
    console.error('❌ Simple email service failed:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendEmailViaAPI,
  sendEmailViaHTTP
}; 
