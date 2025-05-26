const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');

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
    console.log('=== REGISTRATION START ===');
    const safeBody = { ...req.body, password: '[REDACTED]' };
    console.log('Registration request received:', safeBody);
    
    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      phone, 
      birthdate, 
      password, 
      role
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !birthdate || !password || !role) {
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
      return res.status(400).json({ 
        message: 'Email already exists',
        errors: ['This email is already registered']
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
        isVerified: false,
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
        isVerified: false,
        verificationToken,
        tokenExpiry
      });
    }

    // Save user
    await user.save();
    console.log('User saved successfully');

    // Send verification email
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
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
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    return res.json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 