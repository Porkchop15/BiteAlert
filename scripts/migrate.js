const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
require('dotenv').config();

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update Staff documents
    const staffResult = await Staff.updateMany(
      { fullName: { $exists: true } },
      [
        {
          $set: {
            firstName: { $ifNull: ['$firstName', ''] },
            middleName: { $ifNull: ['$middleName', ''] },
            lastName: { $ifNull: ['$lastName', ''] }
          }
        },
        {
          $unset: ['fullName']
        }
      ]
    );
    console.log('Updated Staff documents:', staffResult);

    // Update Patient documents
    const patientResult = await Patient.updateMany(
      { fullName: { $exists: true } },
      [
        {
          $set: {
            firstName: { $ifNull: ['$firstName', ''] },
            middleName: { $ifNull: ['$middleName', ''] },
            lastName: { $ifNull: ['$lastName', ''] }
          }
        },
        {
          $unset: ['fullName']
        }
      ]
    );
    console.log('Updated Patient documents:', patientResult);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate(); 