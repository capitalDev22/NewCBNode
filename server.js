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

// Connect to MongoDB (add this after app initialization)
mongoose.connect('mongodb://localhost:27017/windowcalculator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ MongoDB connected successfully');
})
.catch((err) => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if MongoDB connection fails
});

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cartSession); // This adds req.cartId

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Route inspector utility ---
function logRouteStatus(name, router) {
  if (router && router.stack && router.stack.length > 0) {
    logger.info(`✅ Route "${name}" loaded with ${router.stack.length} handlers.`);
  } else {
    logger.warn(`⚠️ Route "${name}" is empty or not mounted properly.`);
  }
}

// Import routes
const calculationRoutes = require('./routes/api/calculationRoutes');
const cartRoutes = require('./routes/api/cartRoutes');
const pricingRoutes = require('./routes/api/pricingRoutes');
const previewRoutes = require('./routes/api/previewRoutes');

// Mount API routes
app.use('/api/calculations', calculationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/preview', previewRoutes);

// Log route statuses
logRouteStatus('/api/calculations', calculationRoutes);
logRouteStatus('/api/cart', cartRoutes);
logRouteStatus('/api/pricing', pricingRoutes);
logRouteStatus('/api/preview', previewRoutes);

// Serve index.html for all other routes (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Check Express router stack ---
if (app._router && app._router.stack.length > 0) {
  logger.info(`✅ Express app has ${app._router.stack.length} middleware/routes mounted.`);
} else {
  logger.warn('⚠️ Express app has no routes mounted.');
}

// Export the app (important for Vercel)
module.exports = app;

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);

});
