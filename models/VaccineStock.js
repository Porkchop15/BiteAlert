const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., vaxirab, speeda, TCV, ERIG, Booster
  type: { type: String, required: true }, // ARV, TCV, ERIG, Booster
  brand: { type: String }, // Optional for TCV/ERIG/Booster
  stock: { type: Number, required: true, default: 0 }
});

const vaccineStockSchema = new mongoose.Schema({
  centerName: { type: String, required: true },
  vaccines: [vaccineSchema]
});

module.exports = mongoose.model('VaccineStock', vaccineStockSchema); 