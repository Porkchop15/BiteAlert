const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// Get staff profile by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('=== FETCHING STAFF PROFILE ===');
    console.log('Requested staff ID:', req.params.id);

    const staff = await Staff.findOne({ staffId: req.params.id });
    console.log('Staff found:', staff ? 'Yes' : 'No');
    if (staff) {
      console.log('Staff details:', {
        id: staff.staffId,
        email: staff.email,
        name: `${staff.firstName} ${staff.lastName}`
      });
    }

    if (!staff) {
      console.log('Staff not found in database');
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    // Format the response data
    const staffData = {
      id: staff.staffId,
      firstName: staff.firstName,
      middleName: staff.middleName || '',
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      additionalContactNumber: staff.additionalContactNumber || '',
      birthdate: staff.birthdate,
      role: staff.role,
      position: staff.position || '',
      department: staff.department || '',
      officeAddress: staff.officeAddress || '',
      isApproved: staff.isApproved,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt
    };

    console.log('=== SENDING STAFF PROFILE ===');
    console.log('Formatted staff data:', staffData);
    console.log('=== END STAFF PROFILE ===');

    res.json(staffData);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update staff profile
router.put('/:id', async (req, res) => {
  try {
    console.log('=== UPDATING STAFF PROFILE ===');
    console.log('Staff ID to update:', req.params.id);
    console.log('Update data:', req.body);

    const staff = await Staff.findOne({ staffId: req.params.id });
    if (!staff) {
      console.log('Staff not found in database');
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    // Update only the fields that are provided in the request
    const updateFields = [
      'firstName', 'middleName', 'lastName', 'phone', 'additionalContactNumber',
      'position', 'department', 'officeAddress'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    });

    // Update the updatedAt timestamp
    staff.updatedAt = new Date();

    // Save the updated staff
    await staff.save();

    // Format the response data
    const updatedStaffData = {
      id: staff.staffId,
      firstName: staff.firstName,
      middleName: staff.middleName || '',
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      additionalContactNumber: staff.additionalContactNumber || '',
      birthdate: staff.birthdate,
      role: staff.role,
      position: staff.position || '',
      department: staff.department || '',
      officeAddress: staff.officeAddress || '',
      isApproved: staff.isApproved,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt
    };

    console.log('=== SENDING UPDATED STAFF PROFILE ===');
    console.log('Updated staff data:', updatedStaffData);
    console.log('=== END UPDATED STAFF PROFILE ===');

    res.json(updatedStaffData);
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 
