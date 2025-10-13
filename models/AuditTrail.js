const mongoose = require('mongoose');

const auditTrailSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Staff', 'Patient'],
    },
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    middleName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    centerName: {
      type: String,
      default: '',
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['Signed in', 'Signed out'],
      index: true,
    },
    patientID: {
      type: String,
      default: null,
      index: true,
    },
    staffID: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'audittrail',
  }
);

module.exports = mongoose.model('AuditTrail', auditTrailSchema, 'audittrail');


