const express = require('express');
const router = express.Router();
const VaccineStock = require('../models/VaccineStock');

// Error handler middleware
const handleError = (res, error, status = 500) => {
  console.error('Vaccine Stock Error:', error);
  res.status(status).json({
    success: false,
    message: error.message || 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
};

// Get all vaccine stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await VaccineStock.find();
    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Get vaccine stock by center name
router.get('/:centerName', async (req, res) => {
  try {
    const stock = await VaccineStock.findOne({ centerName: req.params.centerName });
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Center not found'
      });
    }
    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Add new vaccine stock
router.post('/', async (req, res) => {
  try {
    const { centerName, vaccines } = req.body;

    if (!centerName) {
      return res.status(400).json({
        success: false,
        message: 'Center name is required'
      });
    }

    if (!Array.isArray(vaccines)) {
      return res.status(400).json({
        success: false,
        message: 'Vaccines must be an array'
      });
    }

    // Validate each vaccine entry
    for (const vaccine of vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.brand) {
        return res.status(400).json({
          success: false,
          message: 'Each vaccine must have name, type, and brand'
        });
      }

      // Initialize empty stockEntries array if not provided
      if (!vaccine.stockEntries) {
        vaccine.stockEntries = [];
      }

      // Validate each stock entry
      for (const entry of vaccine.stockEntries) {
        if (!entry.expirationDate || !entry.branchNo || typeof entry.stock !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each stock entry must have expirationDate, branchNo, and stock'
          });
        }
      }
    }

    const newStock = new VaccineStock({
      centerName,
      vaccines
    });

    const savedStock = await newStock.save();
    res.status(201).json({
      success: true,
      data: savedStock
    });
  } catch (error) {
    handleError(res, error, 400);
  }
});

// Update vaccine stock
router.put('/:centerName', async (req, res) => {
  try {
    const { centerName } = req.params;
    const { vaccines } = req.body;

    if (!Array.isArray(vaccines)) {
      return res.status(400).json({
        success: false,
        message: 'Vaccines must be an array'
      });
    }

    // Validate each vaccine entry
    for (const vaccine of vaccines) {
      if (!vaccine.name || !vaccine.type || !vaccine.brand) {
        return res.status(400).json({
          success: false,
          message: 'Each vaccine must have name, type, and brand'
        });
      }

      // Initialize empty stockEntries array if not provided
      if (!vaccine.stockEntries) {
        vaccine.stockEntries = [];
      }

      // Validate each stock entry
      for (const entry of vaccine.stockEntries) {
        if (!entry.expirationDate || !entry.branchNo || typeof entry.stock !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each stock entry must have expirationDate, branchNo, and stock'
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
      return res.status(404).json({
        success: false,
        message: 'Center not found'
      });
    }

    res.json({
      success: true,
      data: updatedStock
    });
  } catch (error) {
    handleError(res, error, 400);
  }
});

// Delete vaccine stock
router.delete('/:centerName', async (req, res) => {
  try {
    const { centerName } = req.params;
    const deletedStock = await VaccineStock.findOneAndDelete({ centerName });
    
    if (!deletedStock) {
      return res.status(404).json({
        success: false,
        message: 'Center not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Center deleted successfully'
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router; 
