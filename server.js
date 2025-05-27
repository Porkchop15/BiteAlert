const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const staffProfileRoutes = require('./routes/staff_profile');
const patientProfileRoutes = require('./routes/patient_profile');
const biteCaseRoutes = require('./routes/bite_cases');
const vaccinationDateRoutes = require('./routes/vaccination_dates');
const barangayRoutes = require('./routes/barangay');
const vaccineStocksRouter = require('./routes/vaccine_stocks');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Missing');

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://bitealert-frontend.onrender.com',
  'http://localhost:3000',
  'http://192.168.1.10:3000',
  'http://localhost',
  'http://192.168.1.10',
  'http://localhost:52379',      // Flutter Web on Chrome
  'http://127.0.0.1:52379',      // Flutter Web on Chrome (alternate)
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost:8080',
  'http://localhost:8100',
  'https://bitealert-yzau.onrender.com',
  'http://bitealert-yzau.onrender.com',
  'http://10.0.2.2:3000',        // Android emulator
  'http://10.0.2.2'             // Android emulator without port

];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS blocked request from origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    console.log('CORS allowed request from origin:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle verify-email route
app.get('/verify-email/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify-email.html'));
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('=== END REQUEST ===');
  next();
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  console.log('Attempting to connect to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('=== MONGODB CONNECTION SUCCESS ===');
    console.log('Connected to MongoDB successfully');
    console.log('Database:', process.env.MONGODB_URI.split('/').pop());
  } catch (err) {
    console.error('=== MONGODB CONNECTION ERROR ===');
    console.error('MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff-profile', staffProfileRoutes);
app.use('/api/patient-profile', patientProfileRoutes);
app.use('/api/bite-cases', biteCaseRoutes);
app.use('/api/vaccination-dates', vaccinationDateRoutes);
app.use('/api/barangay', barangayRoutes);
app.use('/api/vaccine-stocks', vaccineStocksRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint to check database connection
app.get('/api/debug/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      status: 'ok',
      connectionState: states[state],
      models: Object.keys(mongoose.models),
      database: mongoose.connection.db.databaseName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic route for testing server
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== ERROR OCCURRED ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('=== END ERROR ===');
  
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/test');
  console.log('- GET /api/health');
  console.log('- GET /api/debug/db');
});
