const express = require('express');
const router = express.Router();
const Barangay = require('../models/Barangay');

// Update vaccine distribution
router.put('/:barangayId/distribute', async (req, res) => {
  try {
    const { vaccinesDistributed, vaccinesLeft } = req.body;
    const barangay = await Barangay.findById(req.params.barangayId);

    if (!barangay) {
      return res.status(404).json({ message: 'Barangay not found' });
    }

    barangay.vaccinesDistributed = vaccinesDistributed;
    barangay.vaccinesLeft = vaccinesLeft;
    await barangay.save();

    res.json(barangay);
  } catch (error) {
    console.error('Error updating vaccine distribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vaccine statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Barangay.aggregate([
      {
        $group: {
          _id: null,
          totalVaccinesDistributed: { $sum: '$vaccinesDistributed' },
          totalVaccinesLeft: { $sum: '$vaccinesLeft' },
          totalCases: { $sum: '$totalCases' },
          activeCases: { $sum: '$activeCases' },
        },
      },
    ]);

    res.json(stats[0] || {
      totalVaccinesDistributed: 0,
      totalVaccinesLeft: 0,
      totalCases: 0,
      activeCases: 0,
    });
  } catch (error) {
    console.error('Error fetching vaccine statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 