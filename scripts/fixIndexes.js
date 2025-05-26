const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');

// Load environment variables
dotenv.config();

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Drop the entire database to start fresh
    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully');

    // Create new collections with proper schemas
    console.log('Creating new collections...');
    await Staff.createCollection();
    await Patient.createCollection();
    console.log('Collections created successfully');

    // Create indexes using the models' schema definitions
    console.log('Creating indexes...');
    
    // Create indexes for Staff
    console.log('Creating Staff indexes...');
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
    console.log('Staff indexes created');

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
    console.log('Patient indexes created');

    // Verify indexes
    console.log('Verifying indexes...');
    const staffIndexes = await Staff.collection.indexes();
    const patientIndexes = await Patient.collection.indexes();
    console.log('Staff indexes:', staffIndexes);
    console.log('Patient indexes:', patientIndexes);

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error during database reset:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixIndexes().catch(console.error); 