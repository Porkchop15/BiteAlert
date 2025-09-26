const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Patient = require('../models/Patient');
const VaccinationDate = require('../models/VaccinationDate');
const BiteCase = require('../models/BiteCase');

// Initialize Firebase Admin SDK (you'll need to add your service account key)
let serviceAccount;
try {
  // In production, use environment variable for service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // For development, you can use a local service account file
    serviceAccount = require('../firebase-service-account.json');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK not initialized:', error.message);
  console.warn('⚠️ Push notifications will not work without proper Firebase configuration');
}

// Store FCM tokens for users - support multiple patients per device
const userTokens = new Map(); // userId -> { token, platform, registeredAt, deviceId }
const deviceTokens = new Map(); // deviceId -> Set of userIds

// Register FCM token for a user
router.post('/register-token', async (req, res) => {
  try {
    const { userId, userRole, fcmToken, platform } = req.body;
    
    if (!userId || !fcmToken) {
      return res.status(400).json({ 
        message: 'User ID and FCM token are required' 
      });
    }

    // Generate a device ID based on the FCM token (same token = same device)
    const deviceId = fcmToken.substring(0, 20); // Use first 20 chars as device identifier
    
    // Store token in memory (in production, use database)
    userTokens.set(userId, {
      token: fcmToken,
      userRole,
      platform,
      deviceId,
      registeredAt: new Date()
    });

    // Track which users are on this device
    if (!deviceTokens.has(deviceId)) {
      deviceTokens.set(deviceId, new Set());
    }
    deviceTokens.get(deviceId).add(userId);

    console.log(`✅ FCM token registered for user ${userId} (${userRole}) on device ${deviceId}`);
    console.log(`📱 Device ${deviceId} now has ${deviceTokens.get(deviceId).size} users`);
    
    res.json({ 
      message: 'FCM token registered successfully',
      userId,
      userRole,
      deviceId,
      usersOnDevice: Array.from(deviceTokens.get(deviceId))
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Send notification to specific user
router.post('/send-to-user', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    
    if (!userId || !title || !body) {
      return res.status(400).json({ 
        message: 'User ID, title, and body are required' 
      });
    }

    const userTokenData = userTokens.get(userId);
    if (!userTokenData) {
      return res.status(404).json({ 
        message: 'User token not found' 
      });
    }

    const message = {
      token: userTokenData.token,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification sent to user ${userId}: ${response}`);
    
    res.json({ 
      message: 'Notification sent successfully',
      messageId: response 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Function to send treatment reminder notifications
async function sendTreatmentReminders() {
  try {
    console.log('=== SENDING TREATMENT REMINDERS ===');
    
    // Get all patients with treatments scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find vaccination dates where any dose is scheduled for today and not completed
    // Also exclude if overall treatment is completed
    const todayTreatments = await VaccinationDate.find({
      $and: [
        {
          $or: [
            { d0Date: { $gte: today, $lt: tomorrow }, d0Status: { $ne: 'completed' } },
            { d3Date: { $gte: today, $lt: tomorrow }, d3Status: { $ne: 'completed' } },
            { d7Date: { $gte: today, $lt: tomorrow }, d7Status: { $ne: 'completed' } },
            { d14Date: { $gte: today, $lt: tomorrow }, d14Status: { $ne: 'completed' } },
            { d28Date: { $gte: today, $lt: tomorrow }, d28Status: { $ne: 'completed' } }
          ]
        },
        { treatmentStatus: { $ne: 'completed' } }
      ]
    });

    console.log(`Found ${todayTreatments.length} treatments for today`);

    let notificationsSent = 0;
    const results = [];

    for (const treatment of todayTreatments) {
      try {
        // Find which dose is scheduled for today
        let todayDose = null;
        let doseName = '';
        
        if (treatment.d0Date && treatment.d0Date >= today && treatment.d0Date < tomorrow && treatment.d0Status !== 'completed') {
          todayDose = treatment.d0Date;
          doseName = 'D0';
        } else if (treatment.d3Date && treatment.d3Date >= today && treatment.d3Date < tomorrow && treatment.d3Status !== 'completed') {
          todayDose = treatment.d3Date;
          doseName = 'D3';
        } else if (treatment.d7Date && treatment.d7Date >= today && treatment.d7Date < tomorrow && treatment.d7Status !== 'completed') {
          todayDose = treatment.d7Date;
          doseName = 'D7';
        } else if (treatment.d14Date && treatment.d14Date >= today && treatment.d14Date < tomorrow && treatment.d14Status !== 'completed') {
          todayDose = treatment.d14Date;
          doseName = 'D14';
        } else if (treatment.d28Date && treatment.d28Date >= today && treatment.d28Date < tomorrow && treatment.d28Status !== 'completed') {
          todayDose = treatment.d28Date;
          doseName = 'D28';
        }

        if (!todayDose) continue;

        // Get patient info from the patientId field (it's a string, not populated)
        const userTokenData = userTokens.get(treatment.patientId);
        if (!userTokenData) {
          console.log(`No FCM token found for patient ${treatment.patientId}`);
          continue;
        }

        // Fetch patient name from database
        let patientName = 'Patient';
        try {
          const patient = await Patient.findOne({ patientId: treatment.patientId });
          if (patient) {
            patientName = `${patient.firstName} ${patient.lastName}`.trim();
          }
        } catch (error) {
          console.log(`Could not fetch patient name for ${treatment.patientId}:`, error.message);
        }

        // Check if there are multiple users on this device
        const deviceId = userTokenData.deviceId;
        const usersOnDevice = deviceTokens.has(deviceId) ? Array.from(deviceTokens.get(deviceId)) : [];
        const isMultiUserDevice = usersOnDevice.length > 1;

        const title = 'Treatment Reminder';
        let body;
        
        if (isMultiUserDevice) {
          // Include patient name for multi-user devices
          body = `📋 ${patientName} has a ${doseName} treatment scheduled today. Please visit the center for vaccination.`;
        } else {
          // Standard message for single-user devices
          body = `Hello ${patientName}, you have a ${doseName} treatment scheduled today. Please visit the center for your vaccination.`;
        }

        const message = {
          token: userTokenData.token,
          notification: {
            title,
            body,
          },
          data: {
            type: 'treatment_reminder',
            treatmentId: treatment._id.toString(),
            patientId: treatment.patientId,
            patientName: patientName,
            doseName: doseName,
            scheduledDate: todayDose.toISOString(),
            isMultiUserDevice: isMultiUserDevice.toString(),
            usersOnDevice: usersOnDevice.join(',')
          },
        };

        const response = await admin.messaging().send(message);
        console.log(`✅ Treatment reminder sent to patient ${treatment.patientId}: ${response}`);
        
        notificationsSent++;
        results.push({
          patientId: treatment.patientId,
          patientName: patientName,
          treatmentId: treatment._id,
          doseName: doseName,
          messageId: response,
          isMultiUserDevice: isMultiUserDevice,
          usersOnDevice: usersOnDevice,
          success: true
        });

      } catch (error) {
        console.error(`Error sending reminder to patient ${treatment.patientId}:`, error);
        results.push({
          patientId: treatment.patientId,
          treatmentId: treatment._id,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`✅ Treatment reminders completed: ${notificationsSent}/${todayTreatments.length} sent`);
    
    return {
      message: 'Treatment reminders processed',
      totalTreatments: todayTreatments.length,
      notificationsSent,
      results
    };

  } catch (error) {
    console.error('Error sending treatment reminders:', error);
    throw error;
  }
}

// Send treatment reminder notifications
router.post('/send-treatment-reminders', async (req, res) => {
  try {
    const result = await sendTreatmentReminders();
    res.json(result);
  } catch (error) {
    console.error('Error sending treatment reminders:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user's FCM token status
router.get('/token-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userTokenData = userTokens.get(userId);
    
    if (!userTokenData) {
      return res.status(404).json({ 
        message: 'User token not found' 
      });
    }

    // Get other users on the same device
    const deviceId = userTokenData.deviceId;
    const usersOnDevice = deviceTokens.has(deviceId) ? Array.from(deviceTokens.get(deviceId)) : [];

    res.json({
      userId,
      hasToken: true,
      platform: userTokenData.platform,
      deviceId: userTokenData.deviceId,
      registeredAt: userTokenData.registeredAt,
      usersOnDevice: usersOnDevice
    });
  } catch (error) {
    console.error('Error getting token status:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get all users on a device
router.get('/device-users/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const usersOnDevice = deviceTokens.has(deviceId) ? Array.from(deviceTokens.get(deviceId)) : [];
    
    res.json({
      deviceId,
      usersOnDevice,
      totalUsers: usersOnDevice.length
    });
  } catch (error) {
    console.error('Error getting device users:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Remove user's FCM token
router.delete('/remove-token/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userTokenData = userTokens.get(userId);
    
    if (!userTokenData) {
      return res.status(404).json({ 
        message: 'User token not found' 
      });
    }

    // Remove user from device tracking
    const deviceId = userTokenData.deviceId;
    if (deviceTokens.has(deviceId)) {
      deviceTokens.get(deviceId).delete(userId);
      
      // If no more users on this device, remove device entry
      if (deviceTokens.get(deviceId).size === 0) {
        deviceTokens.delete(deviceId);
        console.log(`📱 Device ${deviceId} has no more users`);
      } else {
        console.log(`📱 Device ${deviceId} now has ${deviceTokens.get(deviceId).size} users`);
      }
    }

    // Remove user token
    userTokens.delete(userId);

    console.log(`✅ FCM token removed for user ${userId}`);
    
    res.json({ 
      message: 'FCM token removed successfully',
      userId,
      remainingUsersOnDevice: deviceTokens.has(deviceId) ? Array.from(deviceTokens.get(deviceId)) : []
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Test notification endpoint
router.post('/test-notification', async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const userTokenData = userTokens.get(userId);
    if (!userTokenData) {
      return res.status(404).json({ 
        message: 'User token not found' 
      });
    }

    const message = {
      token: userTokenData.token,
      notification: {
        title: title || 'Test Notification',
        body: body || 'This is a test notification from BiteAlert',
      },
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Test notification sent to user ${userId}: ${response}`);
    
    res.json({ 
      message: 'Test notification sent successfully',
      messageId: response 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
module.exports.sendTreatmentReminders = sendTreatmentReminders;

