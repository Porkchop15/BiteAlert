const express = require('express');
const router = express.Router();
const VaccineStock = require('../models/VaccineStock');
const AuditTrail = require('../models/AuditTrail');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

async function resolveStaff(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if ((decoded.role || '').toLowerCase() === 'staff') {
        const staff = await Staff.findOne({ staffId: decoded.userId });
        if (staff) {
          return staff;
        }
      }
    }
  } catch (_) {}
  return null;
}

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

    // Audit: Added vaccine stock
    try {
      const auditIntent = (req.headers['x-audit-intent'] || '').toString().toLowerCase();
      if (auditIntent.includes('suppress') || auditIntent === 'vaccination') {
        // Skip auditing when invoked as part of vaccination status updates
      } else {
      const staff = await resolveStaff(req);
      await AuditTrail.create({
        role: 'Staff',
        firstName: staff?.firstName || '',
        middleName: staff?.middleName || '',
        lastName: staff?.lastName || '',
        centerName: centerName,
        action: `Added vaccine stocks for ${centerName}`,
        patientName: '',
        patientID: null,
        staffID: staff?.staffId || null,
      });
      }
    } catch (e) {
      console.error('Failed to write audit for add vaccine stocks:', e);
    }
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

    // Audit: Updated vaccine stock
    try {
      const auditIntent = (req.headers['x-audit-intent'] || '').toString().toLowerCase();
      if (auditIntent.includes('suppress') || auditIntent === 'vaccination') {
        // Skip auditing when invoked as part of vaccination status updates
      } else {
      const staff = await resolveStaff(req);
      await AuditTrail.create({
        role: 'Staff',
        firstName: staff?.firstName || '',
        middleName: staff?.middleName || '',
        lastName: staff?.lastName || '',
        centerName: centerName,
        action: `Updated vaccine stocks for ${centerName}`,
        patientName: '',
        patientID: null,
        staffID: staff?.staffId || null,
      });
      }
    } catch (e) {
      console.error('Failed to write audit for update vaccine stocks:', e);
    }
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

    // Audit: Deleted vaccine stock
    try {
      const auditIntent = (req.headers['x-audit-intent'] || '').toString().toLowerCase();
      if (auditIntent.includes('suppress') || auditIntent === 'vaccination') {
        // Skip auditing when invoked as part of vaccination status updates
      } else {
      const staff = await resolveStaff(req);
      await AuditTrail.create({
        role: 'Staff',
        firstName: staff?.firstName || '',
        middleName: staff?.middleName || '',
        lastName: staff?.lastName || '',
        centerName: centerName,
        action: `Deleted vaccine stocks for ${centerName}`,
        patientName: '',
        patientID: null,
        staffID: staff?.staffId || null,
      });
      }
    } catch (e) {
      console.error('Failed to write audit for delete vaccine stocks:', e);
    }
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router; 
