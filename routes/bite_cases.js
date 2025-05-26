const express = require('express');
const router = express.Router();
const BiteCase = require('../models/BiteCase');

// Create a new bite case
router.post('/', async (req, res) => {
  try {
    console.log('Received request to create bite case:', req.body);
    
    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || ''
    };
    
    const biteCase = new BiteCase(processedBody);
    const savedBiteCase = await biteCase.save();
    
    console.log('Bite case saved successfully:', savedBiteCase);
    res.status(201).json(savedBiteCase);
  } catch (error) {
    console.error('Error creating bite case:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a bite case
router.put('/:id', async (req, res) => {
  try {
    console.log('Received request to update bite case:', req.params.id);
    console.log('Update data:', req.body);

    // Preprocess the request body
    const processedBody = {
      ...req.body,
      middleName: req.body.middleName || ''
    };

    const updatedBiteCase = await BiteCase.findByIdAndUpdate(
      req.params.id,
      processedBody,
      { new: true, runValidators: true }
    );

    if (!updatedBiteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }

    console.log('Bite case updated successfully:', updatedBiteCase);
    res.json(updatedBiteCase);
  } catch (error) {
    console.error('Error updating bite case:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all bite cases
router.get('/', async (req, res) => {
  try {
    const biteCases = await BiteCase.find();
    res.json(biteCases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific bite case
router.get('/:id', async (req, res) => {
  try {
    const biteCase = await BiteCase.findById(req.params.id);
    if (biteCase) {
      res.json(biteCase);
    } else {
      res.status(404).json({ message: 'Bite case not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bite cases by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    console.log('Fetching bite cases for patient ID:', req.params.patientId);
    const biteCases = await BiteCase.find({ patientId: req.params.patientId });
    console.log('Found bite cases:', biteCases);
    res.json(biteCases);
  } catch (error) {
    console.error('Error fetching bite cases:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bite case by registration number
router.get('/registration/:registrationNumber', async (req, res) => {
  try {
    console.log('Fetching bite case by registration number:', req.params.registrationNumber);
    const biteCase = await BiteCase.findOne({ registrationNumber: req.params.registrationNumber });
    
    if (!biteCase) {
      return res.status(404).json({ message: 'Bite case not found' });
    }
    
    console.log('Found bite case:', biteCase);
    res.json(biteCase);
  } catch (error) {
    console.error('Error fetching bite case:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 