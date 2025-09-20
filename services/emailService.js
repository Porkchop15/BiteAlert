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
    },
    connectionTimeout: 5000,  // 5 seconds (very fast timeout for cloud hosting)
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 5000,      // 5 seconds
    pool: false, // Disable pooling for cloud hosting
    maxConnections: 1,
    maxMessages: 1,
    rateDelta: 10000, // 10 seconds
    rateLimit: 1 // max 1 message per rateDelta
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

    // Skip email sending on cloud hosting to avoid delays
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('⚠️ Skipping email sending on cloud hosting to avoid delays');
      return false; // Return false to trigger fallback services
    }

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

    console.log('Sending email...');
    
    // Add timeout wrapper for email sending
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 5000); // 5 second timeout
    });
    
    try {
      const info = await Promise.race([emailPromise, timeoutPromise]);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (sendError) {
      console.error('Email sending failed:', sendError);
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
    
    // Handle specific error types
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.warn('⚠️ Email service timeout. This is common on cloud hosting platforms.');
      console.warn('⚠️ Registration will continue without email verification.');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Connection refused')) {
      console.warn('⚠️ Email service connection refused. Check network/firewall settings.');
      console.warn('⚠️ Registration will continue without email verification.');
    } else if (error.message.includes('Invalid login')) {
      console.warn('⚠️ Email authentication failed. Check EMAIL_USER and EMAIL_PASSWORD.');
      console.warn('⚠️ Registration will continue without email verification.');
    } else {
      console.warn('⚠️ Email sending failed for unknown reason, but registration will continue.');
    }
    
    return false;
  }
};

// Alternative email service using SendGrid API (cloud-friendly)
const sendEmailViaAPI = async (email, token, type = 'verification') => {
  try {
    console.log('=== ATTEMPTING SENDGRID EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    // Check if SendGrid API key is configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.warn('⚠️ SendGrid API key not configured. Using fallback.');
      
      // Log the verification link for testing
      if (type === 'verification') {
        const verificationUrl = `https://bitealert-yzau.onrender.com/verify-email/${token}`;
        console.log('📧 VERIFICATION EMAIL NOT SENT - BUT HERE IS THE LINK:');
        console.log('🔗 Verification URL:', verificationUrl);
        console.log('📧 Email:', email);
        console.log('🔑 Token:', token);
        console.log('💡 You can manually click this link to verify the account');
        console.log('📧 END VERIFICATION EMAIL INFO');
      } else if (type === 'password-reset') {
        console.log('📧 PASSWORD RESET EMAIL NOT SENT - BUT HERE IS THE OTP:');
        console.log('🔑 OTP Code:', token);
        console.log('📧 Email:', email);
        console.log('💡 Use this OTP code in the app to reset password');
        console.log('📧 END PASSWORD RESET EMAIL INFO');
      }
      
      return true; // Return success to not block registration
    }

    // Import SendGrid dynamically to avoid errors if not installed
    let sgMail;
    try {
      sgMail = require('@sendgrid/mail');
    } catch (importError) {
      console.warn('⚠️ SendGrid package not installed. Using fallback.');
      return true;
    }

    sgMail.setApiKey(sendGridApiKey);

    let emailContent;
    if (type === 'verification') {
      emailContent = {
        to: email,
        from: {
          email: 'noreply@bitealert.com',
          name: 'Bite Alert'
        },
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
      emailContent = {
        to: email,
        from: {
          email: 'noreply@bitealert.com',
          name: 'Bite Alert'
        },
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

    console.log('Sending email via SendGrid...');
    const response = await sgMail.send(emailContent);
    console.log('✅ SendGrid email sent successfully:', response[0].statusCode);
    return true;
    
  } catch (error) {
    console.error('❌ SendGrid email service failed:', error);
    
    // If SendGrid fails, log the email details for manual sending
    console.log('📧 Email details for manual sending:');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    return false;
  }
};

// Simple email service using a basic HTTP approach (for testing)
const sendEmailViaHTTP = async (email, token, type = 'verification') => {
  try {
    console.log('=== ATTEMPTING HTTP EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    // For now, just log the email details
    // In a real implementation, you could use services like:
    // - EmailJS
    // - Formspree
    // - Netlify Forms
    // - Any other HTTP-based email service
    
    if (type === 'verification') {
      const verificationUrl = `https://bitealert-yzau.onrender.com/verify-email/${token}`;
      console.log('📧 VERIFICATION EMAIL DETAILS:');
      console.log('🔗 Verification URL:', verificationUrl);
      console.log('📧 Email:', email);
      console.log('🔑 Token:', token);
      console.log('💡 Click the URL above to verify the account');
      console.log('📧 END VERIFICATION EMAIL DETAILS');
    } else if (type === 'password-reset') {
      console.log('📧 PASSWORD RESET EMAIL DETAILS:');
      console.log('🔑 OTP Code:', token);
      console.log('📧 Email:', email);
      console.log('💡 Use this OTP code in the app to reset password');
      console.log('📧 END PASSWORD RESET EMAIL DETAILS');
    }
    
    return true; // Return success
    
  } catch (error) {
    console.error('HTTP email service failed:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendEmailViaAPI,
  sendEmailViaHTTP
}; 
