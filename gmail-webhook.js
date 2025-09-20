require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Use a different port for the webhook service

app.use(cors());
app.use(express.json());

// Email configuration
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log('Gmail Webhook Service Starting...');
console.log('EMAIL_USER:', emailUser ? 'configured' : 'not configured');
console.log('EMAIL_PASSWORD:', emailPassword ? 'configured' : 'not configured');

if (!emailUser || !emailPassword) {
  console.error('❌ EMAIL_USER or EMAIL_PASSWORD environment variables are not set for the webhook service.');
  process.exit(1); // Exit if credentials are not set
}

// Nodemailer transporter
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
  
  console.log('✅ Nodemailer transporter created for Gmail webhook.');
} catch (transporterError) {
  console.error('❌ Failed to create Nodemailer transporter for Gmail webhook:', transporterError);
  transporter = null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BiteAlert Gmail Webhook',
    emailUser: emailUser ? 'configured' : 'not configured',
    transporterReady: !!transporter
  });
});

// Webhook endpoint to send emails
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, type, verification_url, otp_code } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ message: 'Missing required email fields (to, subject, html)' });
    }
    
    if (!transporter) {
      return res.status(500).json({ message: 'Email transporter not initialized' });
    }

    console.log('📧 Webhook received email request:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Type:', type);

    const mailOptions = {
      from: {
        name: 'Bite Alert',
        address: emailUser
      },
      to: to,
      subject: subject,
      html: html
    };

    // Try to send email with timeout
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 15000); // 15 second timeout
    });
    
    try {
      const info = await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Email sent successfully via webhook:', info.messageId);
      res.status(200).json({ 
        message: 'Email sent successfully', 
        messageId: info.messageId,
        success: true
      });
    } catch (sendError) {
      console.error('❌ Email sending failed via webhook:', sendError.message);
      res.status(500).json({ 
        message: 'Failed to send email via webhook', 
        error: sendError.message,
        success: false
      });
    }

  } catch (error) {
    console.error('❌ Webhook email sending failed:', error);
    res.status(500).json({ 
      message: 'Failed to send email via webhook', 
      error: error.message,
      success: false
    });
  }
});

// Test endpoint
app.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ message: 'Missing email address' });
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #7D0C0C; margin: 0; font-size: 24px;">Bite Alert</h1>
          <p style="color: #666666; margin: 5px 0;">Your Health Companion</p>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
            This is a test email from the Bite Alert Gmail Webhook service.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666666; margin: 0;">
            If you received this email, the webhook service is working correctly!
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'Bite Alert',
        address: emailUser
      },
      to: to,
      subject: 'Bite Alert - Test Email',
      html: testHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully:', info.messageId);
    res.status(200).json({ 
      message: 'Test email sent successfully', 
      messageId: info.messageId,
      success: true
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message,
      success: false
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gmail Webhook service listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Send email: http://localhost:${PORT}/send-email`);
  console.log(`Test email: http://localhost:${PORT}/test-email`);
});
