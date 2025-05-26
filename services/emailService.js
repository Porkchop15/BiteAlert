require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('Nodemailer EMAIL_USER:', process.env.EMAIL_USER);
console.log('Nodemailer EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Missing');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:3000/api/auth/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your BiteAlert account',
    html: `
      <h1>Welcome to BiteAlert!</h1>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #7D0C0C;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Verify Email</a>
      <p>If you did not create this account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail
}; 