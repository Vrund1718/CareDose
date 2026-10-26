require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb, getDbStatus } = require('./config/db');
const { securityHeaders, requestLogger, rateLimiter } = require('./middleware/security');

const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const scheduleRoutes = require('./routes/schedules');
const caregiverRoutes = require('./routes/caregivers');
const appointmentRoutes = require('./routes/appointments');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middleware
app.use(securityHeaders);
app.use(requestLogger);

// Enable CORS & Body Parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CareDose Medication & Caregiver Monitoring API',
    database: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', rateLimiter({ max: 60, windowMs: 15 * 60 * 1000 }), authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// Schedules & Doses API Routes (/api/schedules/today & /api/doses/:id/status)
app.use('/api/schedules', scheduleRoutes);
app.use('/api', scheduleRoutes);

// Serve frontend build if frontend/dist exists (unified single-service deployment)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Express Error]:', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Initialize Database and Start Listening
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CareDose REST API Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize server:', err);
});
