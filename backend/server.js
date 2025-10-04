require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Firebase (graceful degradation if not configured)
try {
    initializeFirebase();
} catch (error) {
    console.log('⚠️  Starting without Firebase:', error.message);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/contests', require('./routes/contestRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Social Media Contest Manager API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        name: 'Social Media Contest Manager API',
        version: '1.0.0',
        description: 'Fair and transparent social media contest management',
        endpoints: {
            contests: '/api/contests',
            participants: '/api/participants',
            analytics: '/api/analytics',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  🎯 Social Media Contest Manager                        ║
║  📡 Server running on http://localhost:${PORT}           ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║  ⚡ Ready to accept connections                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
