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
  philhealthNo: {
    type: String,
    required: false,
    default: ''
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
  civilStatus: {
    type: String,
    required: false,
    default: ''
  },
  birthdate: {
    type: String,
    required: false,
    default: ''
  },
  birthplace: {
    type: String,
    required: false,
    default: ''
  },
  nationality: {
    type: String,
    required: false,
    default: ''
  },
  religion: {
    type: String,
    required: false,
    default: ''
  },
  occupation: {
    type: String,
    required: false,
    default: ''
  },
  contactNo: {
    type: String,
    required: false,
    default: ''
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
  weight: {
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
  // History of Bite
  dateOfInquiry: {
    type: String,
    required: false,
    default: ''
  },
  timeOfInjury: {
    type: String,
    required: false,
    default: ''
  },
  
  // Type of Exposure
  typeNonBite: {
    type: Boolean,
    required: false,
    default: false
  },
  typeBite: {
    type: Boolean,
    required: false,
    default: false
  },
  
  // Site of Bite
  headBite: {
    type: Boolean,
    required: false,
    default: false
  },
  faceBite: {
    type: Boolean,
    required: false,
    default: false
  },
  neckBite: {
    type: Boolean,
    required: false,
    default: false
  },
  chestBite: {
    type: Boolean,
    required: false,
    default: false
  },
  backBite: {
    type: Boolean,
    required: false,
    default: false
  },
  abdomenBite: {
    type: Boolean,
    required: false,
    default: false
  },
  upperExtremitiesBite: {
    type: Boolean,
    required: false,
    default: false
  },
  lowerExtremitiesBite: {
    type: Boolean,
    required: false,
    default: false
  },
  othersBite: {
    type: Boolean,
    required: false,
    default: false
  },
  othersBiteSpecify: {
    type: String,
    required: false,
    default: ''
  },
  
  // Nature of Injury
  multipleInjuries: {
    type: Boolean,
    required: false,
    default: false
  },
  abrasion: {
    type: Boolean,
    required: false,
    default: false
  },
  avulsion: {
    type: Boolean,
    required: false,
    default: false
  },
  burn: {
    type: Boolean,
    required: false,
    default: false
  },
  burnDegree: {
    type: Number,
    required: false,
    default: 1
  },
  burnSite: {
    type: String,
    required: false,
    default: ''
  },
  concussion: {
    type: Boolean,
    required: false,
    default: false
  },
  contusion: {
    type: Boolean,
    required: false,
    default: false
  },
  openWound: {
    type: Boolean,
    required: false,
    default: false
  },
  trauma: {
    type: Boolean,
    required: false,
    default: false
  },
  othersInjury: {
    type: Boolean,
    required: false,
    default: false
  },
  othersInjuryDetails: {
    type: String,
    required: false,
    default: ''
  },
  
  // External Cause
  biteSting: {
    type: Boolean,
    required: false,
    default: false
  },
  biteStingDetails: {
    type: String,
    required: false,
    default: ''
  },
  chemicalSubstance: {
    type: Boolean,
    required: false,
    default: false
  },
  chemicalSubstanceDetails: {
    type: String,
    required: false,
    default: ''
  },
  
  // Place of Occurrence
  placeHome: {
    type: Boolean,
    required: false,
    default: false
  },
  placeSchool: {
    type: Boolean,
    required: false,
    default: false
  },
  placeRoad: {
    type: Boolean,
    required: false,
    default: false
  },
  placeNeighbor: {
    type: Boolean,
    required: false,
    default: false
  },
  placeOthers: {
    type: Boolean,
    required: false,
    default: false
  },
  placeOthersDetails: {
    type: String,
    required: false,
    default: ''
  },
  
  // Disposition
  dispositionTreated: {
    type: Boolean,
    required: false,
    default: false
  },
  dispositionTransferred: {
    type: Boolean,
    required: false,
    default: false
  },
  transferredTo: {
    type: String,
    required: false,
    default: ''
  },
  
  // Circumstance of Bite
  circumstanceProvoked: {
    type: Boolean,
    required: false,
    default: false
  },
  circumstanceUnprovoked: {
    type: Boolean,
    required: false,
    default: false
  },
  
  // Animal Profile
  animalDog: {
    type: Boolean,
    required: false,
    default: false
  },
  animalCat: {
    type: Boolean,
    required: false,
    default: false
  },
  animalOthers: {
    type: Boolean,
    required: false,
    default: false
  },
  animalOthersSpecify: {
    type: String,
    required: false,
    default: ''
  },
  animalHealthy: {
    type: Boolean,
    required: false,
    default: false
  },
  animalSick: {
    type: Boolean,
    required: false,
    default: false
  },
  animalDied: {
    type: Boolean,
    required: false,
    default: false
  },
  animalKilled: {
    type: Boolean,
    required: false,
    default: false
  },
  animalBrainExamDone: {
    type: Boolean,
    required: false,
    default: false
  },
  animalNoBrainExam: {
    type: Boolean,
    required: false,
    default: false
  },
  animalUnknown: {
    type: Boolean,
    required: false,
    default: false
  },
  animalImmunized: {
    type: Boolean,
    required: false,
    default: false
  },
  animalNotImmunized: {
    type: Boolean,
    required: false,
    default: false
  },
  animalVaccinationDate: {
    type: String,
    required: false,
    default: ''
  },
  animalPet: {
    type: Boolean,
    required: false,
    default: false
  },
  animalNeighbor: {
    type: Boolean,
    required: false,
    default: false
  },
  animalStray: {
    type: Boolean,
    required: false,
    default: false
  },
  
  // Management
  washingWoundYes: {
    type: Boolean,
    required: false,
    default: false
  },
  washingWoundNo: {
    type: Boolean,
    required: false,
    default: false
  },
  diagnosis: {
    type: String,
    required: false,
    default: ''
  },
  category1: {
    type: Boolean,
    required: false,
    default: false
  },
  category2: {
    type: Boolean,
    required: false,
    default: false
  },
  category3: {
    type: Boolean,
    required: false,
    default: false
  },
  allergyHistory: {
    type: String,
    required: false,
    default: ''
  },
  maintenanceMedications: {
    type: String,
    required: false,
    default: ''
  },
  management: {
    type: String,
    required: false,
    default: ''
  },
  
  // Patient Immunization
  dptComplete: {
    type: Boolean,
    required: false,
    default: false
  },
  dptIncomplete: {
    type: Boolean,
    required: false,
    default: false
  },
  dptNone: {
    type: Boolean,
    required: false,
    default: false
  },
  dptYearGiven: {
    type: String,
    required: false,
    default: ''
  },
  dptDosesGiven: {
    type: String,
    required: false,
    default: ''
  },
  ttActive: {
    type: Boolean,
    required: false,
    default: false
  },
  ttPassive: {
    type: Boolean,
    required: false,
    default: false
  },
  tt1Date: {
    type: String,
    required: false,
    default: ''
  },
  tt2Date: {
    type: String,
    required: false,
    default: ''
  },
  tt3Date: {
    type: String,
    required: false,
    default: ''
  },
  skinTest: {
    type: Boolean,
    required: false,
    default: false
  },
  skinTestTime: {
    type: String,
    required: false,
    default: ''
  },
  skinTestReadTime: {
    type: String,
    required: false,
    default: ''
  },
  skinTestResult: {
    type: String,
    required: false,
    default: ''
  },
  tig: {
    type: Boolean,
    required: false,
    default: false
  },
  tigDose: {
    type: String,
    required: false,
    default: ''
  },
  tigDate: {
    type: String,
    required: false,
    default: ''
  },
  
  // Current Anti-Rabies Immunization
  currentActive: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPostExposure: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPreExposure: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPreviouslyImmunized: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPvrv: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPcec: {
    type: Boolean,
    required: false,
    default: false
  },
  currentId: {
    type: Boolean,
    required: false,
    default: false
  },
  currentIm: {
    type: Boolean,
    required: false,
    default: false
  },
  currentPassive: {
    type: Boolean,
    required: false,
    default: false
  },
  currentSkinTest: {
    type: Boolean,
    required: false,
    default: false
  },
  currentSkinTestTime: {
    type: String,
    required: false,
    default: ''
  },
  currentSkinTestReadTime: {
    type: String,
    required: false,
    default: ''
  },
  currentSkinTestResult: {
    type: String,
    required: false,
    default: ''
  },
  currentHrig: {
    type: Boolean,
    required: false,
    default: false
  },
  hrigDose: {
    type: String,
    required: false,
    default: ''
  },
  hrigDate: {
    type: String,
    required: false,
    default: ''
  },
  currentLocalInfiltration: {
    type: Boolean,
    required: false,
    default: false
  },
  currentStructured: {
    type: Boolean,
    required: false,
    default: false
  },
  currentUnstructured: {
    type: Boolean,
    required: false,
    default: false
  },
  
  status: {
    type: String,
    default: 'in_progress'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BiteCase', biteCaseSchema); 
