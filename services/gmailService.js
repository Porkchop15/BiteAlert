require('dotenv').config();
const nodemailer = require('nodemailer');

// Gmail service configuration
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log('Gmail Service Configuration:');
console.log('EMAIL_USER:', emailUser ? 'configured' : 'not configured');
console.log('EMAIL_PASSWORD:', emailPassword ? 'configured' : 'not configured');

// Create Gmail transporter with optimized settings for cloud hosting
let transporter;

try {
  transporter = nodemailer.createTransporter({
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
    // Optimized settings for cloud hosting
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 10000,     // 10 seconds
    pool: false,              // Disable connection pooling
    maxConnections: 1,        // Single connection
    maxMessages: 1,           // Single message per connection
    rateLimit: 1              // Rate limit
  });
  
  console.log('✅ Gmail transporter created successfully');
} catch (transporterError) {
  console.error('❌ Failed to create Gmail transporter:', transporterError);
  transporter = null;
}

// Send verification email via Gmail
const sendGmailVerification = async (email, token, type = 'verification') => {
  try {
    console.log('=== GMAIL EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);

    // Check if email configuration is available
    if (!emailUser || !emailPassword || emailPassword === 'your-app-password-here') {
      console.warn('⚠️ Gmail service not configured. Skipping email send.');
      return false;
    }

    // Check if transporter is available
    if (!transporter) {
      console.warn('⚠️ Gmail transporter not available. Skipping email send.');
      return false;
    }

    console.log('📧 Attempting to send email via Gmail...');

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

    console.log('Sending email via Gmail...');
    console.log('Email details:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });
    
    // Try to send email with a shorter timeout
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gmail sending timeout')), 15000); // 15 second timeout
    });
    
    try {
      const info = await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Gmail email sent successfully:', info.messageId);
      console.log('📧 Gmail response:', info.response);
      return true;
    } catch (sendError) {
      console.log('⚠️ Gmail email sending failed:', sendError.message);
      console.log('⚠️ This might be due to cloud hosting restrictions');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️ Gmail service error:', error.message);
    return false;
  }
};

// Alternative method using webhook to send email via external service
const sendEmailViaExternalService = async (email, token, type = 'verification') => {
  try {
    console.log('=== WEBHOOK EMAIL SERVICE ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Token:', token);
    
    const verificationUrl = `https://bitealert-yzau.onrender.com/verify-email/${token}`;
    
    // Use the Gmail webhook service
    const webhookUrl = 'https://bitealert-gmail-webhook.onrender.com/send-email';
    
    let emailContent;
    let subject;
    
    if (type === 'verification') {
      subject = 'Bite Alert - Email Verification';
      emailContent = `
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
            <a href="${verificationUrl}" 
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
      `;
    } else if (type === 'password-reset') {
      subject = 'Bite Alert - Password Reset';
      emailContent = `
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
      `;
    }
    
    // Send email via webhook
    try {
      console.log('📧 Attempting to send email via Gmail webhook...');
      
      const emailData = {
        to: email,
        subject: subject,
        html: emailContent,
        type: type,
        verification_url: type === 'verification' ? verificationUrl : null,
        otp_code: type === 'password-reset' ? token : null
      };
      
      // Use fetch to send email via webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via Gmail webhook:', result.messageId);
        return true;
      } else {
        console.error('❌ Gmail webhook failed:', response.status, response.statusText);
        return false;
      }
      
    } catch (webhookError) {
      console.error('Gmail webhook error:', webhookError);
      return false;
    }
    
  } catch (error) {
    console.error('Webhook email service failed:', error);
    return false;
  }
};

module.exports = {
  sendGmailVerification,
  sendEmailViaExternalService
};
