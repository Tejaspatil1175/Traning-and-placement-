const express = require('express');
const cors = require('cors');
const compression = require('compression');
const createRateLimiter = require('./middleware/rateLimiter');
const performanceMonitor = require('./middleware/performanceMonitor');

const app = express();

// Performance monitoring
app.use(performanceMonitor);

// Enable compression for all responses
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting - Different limits for different routes
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20, // Stricter for auth routes
  message: 'Too many authentication attempts, please try again later.'
});

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Training & Placement Automation System API',
    version: '1.0.0',
    status: 'optimized',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      companies: '/api/companies',
      upload: '/api/upload',
      dashboard: '/api/dashboard'
    }
  });
});

// Apply rate limiters
app.use('/api/auth', strictLimiter, require('./routes/authRoutes'));
app.use('/api/students', generalLimiter, require('./routes/studentRoutes'));
app.use('/api/companies', generalLimiter, require('./routes/companyRoutes'));
app.use('/api/upload', generalLimiter, require('./routes/uploadRoutes'));
app.use('/api/dashboard', generalLimiter, require('./routes/dashboardRoutes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
