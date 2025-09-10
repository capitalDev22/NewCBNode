// server.js
const logger = require('./utils/logger');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const cartSession = require('./middleware/cartSession');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/windowcalculator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ MongoDB connected successfully');
})
.catch((err) => {
  logger.error('❌ MongoDB connection error:', err);
  // ⚠️ don't exit in serverless environment
});

// Middleware
app.use(cookieParser());
app.use(cartSession);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route inspector
function logRouteStatus(name, router) {
  if (router?.stack?.length > 0) {
    logger.info(`✅ Route "${name}" loaded with ${router.stack.length} handlers.`);
  } else {
    logger.warn(`⚠️ Route "${name}" is empty or not mounted properly.`);
  }
}

// Routes
const calculationRoutes = require('./routes/api/calculationRoutes');
const cartRoutes = require('./routes/api/cartRoutes');
const pricingRoutes = require('./routes/api/pricingRoutes');
const previewRoutes = require('./routes/api/previewRoutes');

app.use('/api/calculations', calculationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/preview', previewRoutes);

logRouteStatus('/api/calculations', calculationRoutes);
logRouteStatus('/api/cart', cartRoutes);
logRouteStatus('/api/pricing', pricingRoutes);
logRouteStatus('/api/preview', previewRoutes);

// Serve SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app (important for Vercel)
module.exports = app;
