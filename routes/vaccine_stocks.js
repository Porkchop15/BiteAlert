const express = require('express');
const router = express.Router();
const VaccineStock = require('../models/VaccineStock');

// Get all vaccine stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await VaccineStock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vaccine stock by center name
router.get('/:centerName', async (req, res) => {
  try {
    const stock = await VaccineStock.findOne({ centerName: req.params.centerName });
    if (!stock) return res.status(404).json({ message: 'Center not found' });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new vaccine stock entry
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.centerName) {
      return res.status(400).json({ message: 'Center name is required' });
    }

    // Validate vaccines array
    if (!Array.isArray(req.body.vaccines)) {
      return res.status(400).json({ message: 'Vaccines must be an array' });
    }

    // Validate each vaccine entry
    for (const vaccine of req.body.vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.stock || !vaccine.expirationDate) {
        return res.status(400).json({ 
          message: 'Each vaccine must have name, type, stock, and expiration date' 
        });
      }

      // Validate expiration date format (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!dateRegex.test(vaccine.expirationDate)) {
        return res.status(400).json({ 
          message: 'Invalid expiration date format. Use MM/DD/YYYY' 
        });
      }

      // Convert expiration date to Date object
      const [month, day, year] = vaccine.expirationDate.split('/');
      vaccine.expirationDate = new Date(year, month - 1, day);
    }

    const newStock = new VaccineStock(req.body);
    const saved = await newStock.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vaccine stock by center name
router.put('/:centerName', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.centerName) {
      return res.status(400).json({ message: 'Center name is required' });
    }

    // Validate vaccines array
    if (!Array.isArray(req.body.vaccines)) {
      return res.status(400).json({ message: 'Vaccines must be an array' });
    }

    // Validate each vaccine entry
    for (const vaccine of req.body.vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.stock || !vaccine.expirationDate) {
        return res.status(400).json({ 
          message: 'Each vaccine must have name, type, stock, and expiration date' 
        });
      }

      // Validate expiration date format (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!dateRegex.test(vaccine.expirationDate)) {
        return res.status(400).json({ 
          message: 'Invalid expiration date format. Use MM/DD/YYYY' 
        });
      }

      // Convert expiration date to Date object
      const [month, day, year] = vaccine.expirationDate.split('/');
      vaccine.expirationDate = new Date(year, month - 1, day);
    }

    const updated = await VaccineStock.findOneAndUpdate(
      { centerName: req.params.centerName },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Center not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vaccine stock by center name
router.delete('/:centerName', async (req, res) => {
  try {
    const deleted = await VaccineStock.findOneAndDelete({ centerName: req.params.centerName });
    if (!deleted) return res.status(404).json({ message: 'Center not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
