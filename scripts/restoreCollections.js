const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const BiteCase = require('../models/BiteCase');
const VaccinationDate = require('../models/VaccinationDate');

// Load environment variables
dotenv.config();

async function restoreCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create collections with proper schemas
    console.log('\nCreating collections...');
    await Staff.createCollection();
    await Patient.createCollection();
    await BiteCase.createCollection();
    await VaccinationDate.createCollection();
    console.log('Collections created successfully');

    // Create indexes for Staff
    console.log('\nCreating Staff indexes...');
    await Staff.collection.createIndexes([
      {
        key: { staffId: 1 },
        name: 'staffId_unique',
        unique: true,
        sparse: true,
        background: true
      },
      {
        key: { email: 1 },
        name: 'staff_email_unique',
        unique: true,
        background: true
      }
    ]);

    // Create indexes for Patient
    console.log('Creating Patient indexes...');
    await Patient.collection.createIndexes([
      {
        key: { patientId: 1 },
        name: 'patientId_unique',
        unique: true,
        sparse: true,
        background: true
      },
      {
        key: { email: 1 },
        name: 'patient_email_unique',
        unique: true,
        background: true
      }
    ]);

    // Create indexes for BiteCase
    console.log('Creating BiteCase indexes...');
    await BiteCase.collection.createIndexes([
      {
        key: { registrationNumber: 1 },
        name: 'registrationNumber_unique',
        unique: true,
        background: true
      },
      {
        key: { patientId: 1 },
        name: 'patientId_index',
        background: true
      }
    ]);

    // Create indexes for VaccinationDate
    console.log('Creating VaccinationDate indexes...');
    await VaccinationDate.collection.createIndexes([
      {
        key: { biteCaseId: 1 },
        name: 'biteCaseId_index',
        background: true
      },
      {
        key: { patientId: 1 },
        name: 'patientId_index',
        background: true
      },
      {
        key: { registrationNumber: 1 },
        name: 'registrationNumber_index',
        background: true
      }
    ]);

    // Verify collections and indexes
    console.log('\nVerifying collections and indexes...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    console.log('=======================');
    for (const collection of collections) {
      const indexes = await mongoose.connection.db.collection(collection.name).indexes();
      console.log(`\n${collection.name}:`);
      console.log('Indexes:', indexes.map(idx => idx.name).join(', '));
    }

    console.log('\nCollections restored successfully');
  } catch (error) {
    console.error('Error during restoration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the restoration
restoreCollections().catch(console.error); 