const express = require('express');
const router = express.Router();
const VaccinationDate = require('../models/VaccinationDate');
const mongoose = require('mongoose');

// Create vaccination dates for a bite case
router.post('/', async (req, res) => {
  try {
    console.log('Creating vaccination dates:', req.body);
    const vaccinationDateData = {
      ...req.body,
      treatmentStatus: req.body.treatmentStatus || 'in_progress'
    };
    const vaccinationDate = new VaccinationDate(vaccinationDateData);
    const savedVaccinationDate = await vaccinationDate.save();
    console.log('Vaccination dates saved:', savedVaccinationDate);
    res.status(201).json(savedVaccinationDate);
  } catch (error) {
    console.error('Error creating vaccination dates:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get vaccination dates by bite case ID
router.get('/bite-case/:biteCaseId', async (req, res) => {
  try {
    const vaccinationDates = await VaccinationDate.find({ biteCaseId: req.params.biteCaseId });
    res.json(vaccinationDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vaccination dates by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const vaccinationDates = await VaccinationDate.find({ patientId: req.params.patientId });
    res.json(vaccinationDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all vaccination dates
router.get('/', async (req, res) => {
  try {
    const vaccinationDates = await VaccinationDate.find();
    res.json(vaccinationDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vaccination dates
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating vaccination dates. Request body:', req.body);
    
    // Get the existing record first
    const existingVaccinationDate = await VaccinationDate.findById(req.params.id);
    if (!existingVaccinationDate) {
      return res.status(404).json({ message: 'Vaccination dates not found' });
    }

    // Create update data without modifying d14Status and d28Status
    const vaccinationDateData = {
      d0Date: req.body.d0Date,
      d3Date: req.body.d3Date,
      d7Date: req.body.d7Date,
      d14Date: req.body.d14Date,
      d28Date: req.body.d28Date,
      d0Status: req.body.d0Status,
      d3Status: req.body.d3Status,
      d7Status: req.body.d7Status,
      treatmentStatus: req.body.treatmentStatus // Always use the provided treatment status
    };

    // Only update d14Status and d28Status if they are explicitly provided
    if (req.body.d14Status) {
      vaccinationDateData.d14Status = req.body.d14Status;
    }
    if (req.body.d28Status) {
      vaccinationDateData.d28Status = req.body.d28Status;
    }

    console.log('Processed vaccination date data:', vaccinationDateData);
    console.log('Treatment status being set to:', req.body.treatmentStatus);
    
    const updatedVaccinationDate = await VaccinationDate.findByIdAndUpdate(
      req.params.id,
      vaccinationDateData,
      { new: true, runValidators: true }
    );

    if (!updatedVaccinationDate) {
      return res.status(404).json({ message: 'Vaccination dates not found' });
    }

    console.log('Updated vaccination date:', updatedVaccinationDate);
    res.json(updatedVaccinationDate);
  } catch (error) {
    console.error('Error updating vaccination dates:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(400).json({ 
      message: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
});

module.exports = router; 
