const mongoose = require('mongoose');

const barangaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  totalCases: {
    type: Number,
    default: 0,
  },
  activeCases: {
    type: Number,
    default: 0,
  },
  vaccinesDistributed: {
    type: Number,
    default: 0,
  },
  vaccinesLeft: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
barangaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Barangay', barangaySchema); 