const mongoose = require('mongoose');

const biteCaseSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  dateRegistered: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: false,
    default: ''
  },
  lastName: {
    type: String,
    required: true
  },
  houseNo: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  subdivision: {
    type: String,
    required: false,
    default: ''
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    required: true
  },
  center: {
    type: String,
    required: true
  },
  typeOfProphylaxis: {
    type: String,
    required: true,
    enum: ['Pre-exposure', 'Post-exposure']
  },
  exposureDate: {
    type: String,
    required: true
  },
  exposurePlace: {
    type: String,
    required: true
  },
  exposureType: {
    type: String,
    required: true
  },
  exposureSource: {
    type: String,
    required: true
  },
  exposureCategory: {
    type: String,
    required: true
  },
  washingWound: {
    type: Boolean,
    required: true
  },
  rig: {
    type: Boolean,
    required: true
  },
  genericName: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  lastArn: {
    type: String
  },
  completed: {
    type: String
  },
  tt: {
    type: String
  },
  scheduleDates: {
    type: [String],
    required: true
  },
  animalStatus: {
    type: String
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    default: 'in_progress'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BiteCase', biteCaseSchema); 