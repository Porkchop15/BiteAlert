const mongoose = require('mongoose');
const VaccinationDate = require('../models/VaccinationDate');
require('dotenv').config();

async function updateVaccinationDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Update all vaccination dates records
    const result = await VaccinationDate.updateMany(
      {},
      {
        $set: {
          d14Status: 'optional',
          d28Status: 'optional'
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} records`);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
updateVaccinationDates(); 