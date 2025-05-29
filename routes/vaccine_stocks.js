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

// Add new vaccine stock
router.post('/', async (req, res) => {
  try {
    const { centerName, vaccines } = req.body;

    if (!centerName) {
      return res.status(400).json({ message: 'Center name is required' });
    }

    if (!Array.isArray(vaccines)) {
      return res.status(400).json({ message: 'Vaccines must be an array' });
    }

    // Validate each vaccine entry
    for (const vaccine of vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.brand) {
        return res.status(400).json({ 
          message: 'Each vaccine must have name, type, and brand' 
        });
      }

      // Initialize empty stockEntries array if not provided
      if (!vaccine.stockEntries) {
        vaccine.stockEntries = [];
      }

      // Validate each stock entry
      for (const entry of vaccine.stockEntries) {
        if (!entry.expirationDate || typeof entry.stock !== 'number') {
          return res.status(400).json({ 
            message: 'Each stock entry must have expirationDate and stock' 
          });
        }
      }
    }

    const newStock = new VaccineStock({
      centerName,
      vaccines
    });

    const savedStock = await newStock.save();
    res.status(201).json(savedStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vaccine stock
router.put('/:centerName', async (req, res) => {
  try {
    const { centerName } = req.params;
    const { vaccines } = req.body;

    if (!Array.isArray(vaccines)) {
      return res.status(400).json({ message: 'Vaccines must be an array' });
    }

    // Validate each vaccine entry
    for (const vaccine of vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.brand) {
        return res.status(400).json({ 
          message: 'Each vaccine must have name, type, and brand' 
        });
      }

      // Initialize empty stockEntries array if not provided
      if (!vaccine.stockEntries) {
        vaccine.stockEntries = [];
      }

      // Validate each stock entry
      for (const entry of vaccine.stockEntries) {
        if (!entry.expirationDate || typeof entry.stock !== 'number') {
          return res.status(400).json({ 
            message: 'Each stock entry must have expirationDate and stock' 
          });
        }
      }
    }

    const updatedStock = await VaccineStock.findOneAndUpdate(
      { centerName },
      { vaccines },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json(updatedStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vaccine stock
router.delete('/:centerName', async (req, res) => {
  try {
    const { centerName } = req.params;
    const deletedStock = await VaccineStock.findOneAndDelete({ centerName });
    
    if (!deletedStock) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
