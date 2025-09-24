const mongoose = require('mongoose');

// Use loose schema to match existing documents; bind to center_hours collection
const CenterHourSchema = new mongoose.Schema({}, { strict: false, collection: 'center_hours' });

module.exports = mongoose.model('CenterHour', CenterHourSchema);


