const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');
const path = require('path');

// Debug route to check database contents
router.get('/debug/users', async (req, res) => {
  try {
    const staff = await Staff.find({}, { password: 0 });
    const patients = await Patient.find({}, { password: 0 });
    res.json({
      staff,
      patients,
      totalStaff: staff.length,
      totalPatients: patients.length
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug route to check specific user
router.get('/debug/user/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const staff = await Staff.findOne({ email });
    const patient = await Patient.findOne({ email });
    
    if (staff) {
      res.json({
        found: true,
        type: 'staff',
        user: {
          email: staff.email,
          firstName: staff.firstName,
          middleName: staff.middleName,
          lastName: staff.lastName,
          role: staff.role,
          hasPassword: !!staff.password
        }
      });
    } else if (patient) {
      res.json({
        found: true,
        type: 'patient',
        user: {
          email: patient.email,
          firstName: patient.firstName,
          middleName: patient.middleName,
          lastName: patient.lastName,
          role: patient.role,
          hasPassword: !!patient.password
        }
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Temporary storage for OTPs (in production, use Redis or similar)
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Login attempt for email:', normalizedEmail);
    console.log('Password received:', password ? 'Yes' : 'No');
    
    // First try staff login
    console.log('Checking staff collection...');
    const staff = await Staff.findOne({ email: normalizedEmail });
    if (staff) {
      console.log('Found staff user:', staff.email);
      console.log('Staff user ID:', staff.staffId);
      console.log('Staff role:', staff.role);
      console.log('Staff isApproved:', staff.isApproved);
      
      // Check if staff is approved
      if (!staff.isApproved) {
        console.log('Staff account not approved:', staff.email);
        return res.status(403).json({ 
          message: 'Your account is pending approval. Please contact the administrator.',
          isApproved: false
        });
      }
      
      try {
        console.log('Comparing staff password...');
        const isMatch = await staff.comparePassword(password);
        console.log('Staff password match:', isMatch);
        if (isMatch) {
          const token = jwt.sign(
            { userId: staff.staffId, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          console.log('=== LOGIN SUCCESS (STAFF) ===');
          
          const userData = {
            id: staff.staffId,
            firstName: staff.firstName,
            middleName: staff.middleName || '',
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone,
            birthdate: staff.birthdate,
            role: staff.role,
            position: staff.position || '',
            department: staff.department || '',
            healthServices: staff.healthServices || '',
            isApproved: staff.isApproved,
            isVerified: staff.isVerified,
            createdAt: staff.createdAt,
            updatedAt: staff.updatedAt
          };

          console.log('=== SENDING LOGIN RESPONSE ===');
          console.log('Formatted user data:', userData);
          console.log('=== END LOGIN RESPONSE ===');

          return res.json({
            message: 'Login successful',
            user: userData,
            token: token
          });
        } else {
          console.log('Staff password does not match');
        }
      } catch (error) {
        console.error('Error comparing staff password:', error);
      }
    } else {
      console.log('No staff user found with email:', normalizedEmail);
    }

    // If staff login fails, try patient login
    console.log('Checking patient collection...');
    const patient = await Patient.findOne({ email: normalizedEmail });
    if (patient) {
      console.log('Found patient user:', patient.email);
      console.log('Patient user ID:', patient.patientId);
      console.log('Patient role:', patient.role);
      try {
        console.log('Comparing patient password...');
        const isMatch = await patient.comparePassword(password);
        console.log('Patient password match:', isMatch);
        if (isMatch) {
          const token = jwt.sign(
            { userId: patient.patientId, role: patient.role.toLowerCase() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          console.log('=== LOGIN SUCCESS (PATIENT) ===');
          
          const userData = {
            id: patient.patientId,
            firstName: patient.firstName,
            middleName: patient.middleName || '',
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            birthdate: patient.birthdate,
            role: patient.role,
            isVerified: patient.isVerified,
          };

          console.log('=== SENDING LOGIN RESPONSE ===');
          console.log('Formatted user data:', userData);
          console.log('=== END LOGIN RESPONSE ===');

          return res.json({
            message: 'Login successful',
            user: userData,
            token: token
          });
        } else {
          console.log('Patient password does not match');
        }
      } catch (error) {
        console.error('Error comparing patient password:', error);
      }
    } else {
      console.log('No patient user found with email:', normalizedEmail);
    }

    console.log('=== LOGIN FAILED: Invalid credentials ===');
    return res.status(401).json({ 
      message: 'Invalid email or password',
      details: 'Please check your email and password and try again.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'An unexpected error occurred during login. Please try again.'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', { ...req.body, password: '[REDACTED]' });
    
    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      phone, 
      birthdate, 
      password, 
      role,
      isVerified
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !birthdate || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        errors: ['All required fields must be filled out']
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);
    
    // Check both collections for existing email
    console.log('Checking for existing email in both collections...');
    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    const existingPatient = await Patient.findOne({ email: normalizedEmail });
    
    if (existingStaff || existingPatient) {
      console.log('User already exists:', normalizedEmail);
      return res.status(400).json({ 
        message: 'Email already exists',
        errors: ['This email is already registered']
      });
    }

    // Generate verification token (only if not pre-verified)
    const verificationToken = isVerified === true ? undefined : generateVerificationToken();
    const tokenExpiry = isVerified === true ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log('Generated verification token with expiry:', tokenExpiry);
    console.log('isVerified parameter:', isVerified);

    // Create user based on role
    let user;
    if (role.toLowerCase() === 'staff') {
      user = new Staff({
        firstName,
        middleName,
        lastName,
        email: normalizedEmail,
        phone,
        birthdate,
        password,
        role: 'staff',
        isApproved: false,
        isVerified: isVerified === true ? true : false,
        verificationToken,
        tokenExpiry
      });
    } else {
      user = new Patient({
        firstName,
        middleName,
        lastName,
        email: normalizedEmail,
        phone,
        birthdate,
        password,
        role: 'patient',
        isVerified: isVerified === true ? true : false,
        verificationToken,
        tokenExpiry
      });
    }

    // Save user
    await user.save();
    console.log('User saved successfully');

    // Send verification email (only if not pre-verified)
    if (isVerified !== true && verificationToken) {
      try {
        console.log('Attempting to send verification email...');
        await sendVerificationEmail(normalizedEmail, verificationToken);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't prevent registration if email fails
      }
    } else {
      console.log('Skipping verification email - user is pre-verified');
    }

    const successMessage = isVerified 
      ? 'Registration successful. Account is verified and ready to use.'
      : 'Registration successful. Please check your email to verify your account.';

    return res.status(201).json({
      message: successMessage,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this token
    const staff = await Staff.findOne({ 
      verificationToken: token,
      tokenExpiry: { $gt: Date.now() }
    });
    
    const patient = await Patient.findOne({ 
      verificationToken: token,
      tokenExpiry: { $gt: Date.now() }
    });

    const user = staff || patient;
    
    if (!user) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
      }
      return res.redirect('/verify-email.html');
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      message: 'Email verified successfully'
    });
    }

    // Redirect to the HTML page for browser requests
    return res.redirect('/verify-email.html');
  } catch (error) {
    console.error('Email verification error:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
    }
    return res.redirect('/verify-email.html');
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Email:', normalizedEmail);

    // Check both collections for the email
    const staff = await Staff.findOne({ email: normalizedEmail });
    const patient = await Patient.findOne({ email: normalizedEmail });

    if (!staff && !patient) {
      console.log('Email not found in database');
      return res.status(404).json({ message: 'Email not found in either patient or staff records' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    console.log('Generated OTP:', otp);
    console.log('OTP Expiry:', new Date(otpExpiry));

    // Store OTP
    otpStore.set(normalizedEmail, {
      otp,
      expiry: otpExpiry,
      type: staff ? 'staff' : 'patient'
    });

    console.log('OTP stored successfully');
    console.log('Current OTP store contents:', Array.from(otpStore.entries()));

    // Send OTP via email
    try {
      await sendVerificationEmail(normalizedEmail, otp, 'password-reset');
      console.log('OTP email sent successfully');
      return res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ message: 'Error sending OTP' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log('=== OTP VERIFICATION ATTEMPT ===');
    console.log('Email:', normalizedEmail);
    console.log('Received OTP:', otp);
    console.log('OTP Store contents:', Array.from(otpStore.entries()));

    const storedData = otpStore.get(normalizedEmail);
    console.log('Stored data for email:', storedData);

    if (!storedData) {
      console.log('No OTP found for this email');
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (Date.now() > storedData.expiry) {
      console.log('OTP expired. Current time:', Date.now(), 'Expiry:', storedData.expiry);
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    console.log('Comparing OTPs - Received:', otp, 'Stored:', storedData.otp);
    if (storedData.otp !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    console.log('OTP verified successfully');
    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate password format
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Invalid password format',
        details: 'Password must be at least 8 characters long'
      });
    }

    // Check for required password components
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        message: 'Invalid password format',
        details: 'Password must contain at least one uppercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)'
      });
    }

    // Find user in both collections
    const staff = await Staff.findOne({ email: normalizedEmail });
    const patient = await Patient.findOne({ email: normalizedEmail });

    if (!staff && !patient) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update password in the appropriate collection
    if (staff) {
      staff.password = newPassword;
      await staff.save();
    } else {
      patient.password = newPassword;
      await patient.save();
    }

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid password format',
        details: error.message
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
