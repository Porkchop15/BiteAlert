const express = require('express');
const router = express.Router();
const CenterHour = require('../models/CenterHour');

// GET /api/center-hours → returns all center hours (selected fields)
router.get('/center-hours', async (req, res, next) => {
  try {
    const rows = await CenterHour.find({}, { name: 1, hours: 1 }).lean();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


