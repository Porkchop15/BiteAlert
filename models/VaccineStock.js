const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    enum: ['VAXIRAB', 'SPEEDA', 'Tetanus Toxoid-Containing Vaccine', 'Equine Rabies Immunoglobulin', 'Booster Vaccine']
  }, // e.g., vaxirab, speeda, Tetanus Toxoid-Containing Vaccine, Equine Rabies Immunoglobulin, Booster Vaccine
  type: { 
    type: String, 
    required: true,
    enum: ['Anti-Rabies Vaccine', 'Tetanus Toxoid-Containing Vaccine', 'Equine Rabies Immunoglobulin', 'Booster Vaccine']
  }, // ARV, TCV, ERIG, Booster
  brand: { type: String, required: true }, // Optional for TCV/ERIG/Booster
  stockEntries: [{
    expirationDate: { type: String, required: true },
    stock: { type: Number, required: true }
  }]
});

const vaccineStockSchema = new mongoose.Schema({
  centerName: { type: String, required: true },
  vaccines: [vaccineSchema]
});

module.exports = mongoose.model('VaccineStock', vaccineStockSchema); 
