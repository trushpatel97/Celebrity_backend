require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const knex = require('knex');

console.log('---- STARTUP DIAGNOSTICS ----');
console.log('Initial process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('Initial process.env.DATABASE_URL (first 20 chars):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : 'NOT SET');
const bcrypt = require('bcrypt');

// Import controllers
const register = require('./controller/register');
const signin = require('./controller/signin');
const profile = require('./controller/profile');
const image = require('./controller/image');

// Initialize Knex with configuration based on environment
const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
console.log('Selected Knex environment:', environment);
console.log('Knex config being used:', JSON.stringify(config, null, 2));
const db = knex(config);
console.log('---- END STARTUP DIAGNOSTICS ----');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors((req, callback) => {
  let corsOptions;
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(',') : [];
  if (allowedOrigins.includes('*') || (req.header('Origin') && allowedOrigins.includes(req.header('Origin')))) {
    corsOptions = { origin: true }; // Reflects the request origin
  } else {
    corsOptions = { origin: false }; // Disallow CORS for this origin
  }
  corsOptions.credentials = true;
  corsOptions.methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  corsOptions.allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'];
  corsOptions.exposedHeaders = ['Content-Range', 'X-Content-Range'];
  corsOptions.maxAge = 600;
  corsOptions.optionsSuccessStatus = 204; // Use 204 for OPTIONS success status as per best practice
  callback(null, corsOptions); // Callback expects two params: error and options
}));

// Explicitly handle OPTIONS requests (preflight)
// This should come before your routes
app.options('*', cors((req, callback) => {
  let corsOptions;
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(',') : [];
  if (allowedOrigins.includes('*') || (req.header('Origin') && allowedOrigins.includes(req.header('Origin')))) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  corsOptions.credentials = true;
  corsOptions.methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  corsOptions.allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'];
  corsOptions.exposedHeaders = ['Content-Range', 'X-Content-Range'];
  corsOptions.maxAge = 600;
  corsOptions.optionsSuccessStatus = 204;
  callback(null, corsOptions);
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Celebrity Recognition API' });
});

// Authentication routes
app.post('/signin', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => signin.handleSignin(req, res, db, bcrypt));

app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], (req, res) => register.handleRegister(req, res, db, bcrypt));

// User profile routes
app.get('/profile/:id', (req, res) => profile.handleProfileGet(req, res, db));

// Image processing routes
app.put('/image', (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', (req, res) => image.handleAPICall(req, res, db));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

