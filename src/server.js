/**
 * Main Server File
 * Express server configuration and middleware setup
 */

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const ivrRoutes = require('./routes/ivr');
const callRoutes = require('./routes/call');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Add header to bypass ngrok browser warning
app.use((req, res, next) => {
  res.set('ngrok-skip-browser-warning', 'true');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Plivo IVR System'
  });
});

// Routes
app.use('/ivr', ivrRoutes);
app.use('/', callRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IVR server running on port ${PORT}`);
  console.log(`📞 Server URL: ${process.env.SERVER_URL || 'http://localhost:' + PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
