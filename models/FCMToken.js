const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  fcmToken: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['android', 'ios', 'web', 'flutter']
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['patient', 'staff']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'fcm_tokens'
});

// Indexes for better performance
fcmTokenSchema.index({ userId: 1, isActive: 1 });
fcmTokenSchema.index({ deviceId: 1 });
fcmTokenSchema.index({ fcmToken: 1 });

const FCMToken = mongoose.model('FCMToken', fcmTokenSchema);

module.exports = FCMToken;
