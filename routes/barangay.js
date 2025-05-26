const express = require('express');
const router = express.Router();
const Barangay = require('../models/Barangay');

// Get all barangays
router.get('/', async (req, res) => {
  try {
    const barangays = await Barangay.find().sort({ name: 1 });
    res.json(barangays);
  } catch (error) {
    console.error('Error fetching barangays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new barangay
router.post('/', async (req, res) => {
  try {
    const { name, totalCases, activeCases, vaccinesDistributed, vaccinesLeft } = req.body;
    
    const existingBarangay = await Barangay.findOne({ name });
    if (existingBarangay) {
      return res.status(400).json({ message: 'Barangay already exists' });
    }

    const barangay = new Barangay({
      name,
      totalCases: totalCases || 0,
      activeCases: activeCases || 0,
      vaccinesDistributed: vaccinesDistributed || 0,
      vaccinesLeft: vaccinesLeft || 0,
    });

    await barangay.save();
    res.status(201).json(barangay);
  } catch (error) {
    console.error('Error creating barangay:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update barangay
router.put('/:id', async (req, res) => {
  try {
    const { totalCases, activeCases, vaccinesDistributed, vaccinesLeft } = req.body;
    
    const barangay = await Barangay.findByIdAndUpdate(
      req.params.id,
      {
        totalCases,
        activeCases,
        vaccinesDistributed,
        vaccinesLeft,
      },
      { new: true }
    );

    if (!barangay) {
      return res.status(404).json({ message: 'Barangay not found' });
    }

    res.json(barangay);
  } catch (error) {
    console.error('Error updating barangay:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete barangay
router.delete('/:id', async (req, res) => {
  try {
    const barangay = await Barangay.findByIdAndDelete(req.params.id);
    
    if (!barangay) {
      return res.status(404).json({ message: 'Barangay not found' });
    }

    res.json({ message: 'Barangay deleted successfully' });
  } catch (error) {
    console.error('Error deleting barangay:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 