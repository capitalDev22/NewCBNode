// utils/logger.js - OPTIMIZED VERSION
const winston = require('winston');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'warn' : 'debug', // Production: only warnings and errors
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// File logging ONLY in production
if (isProduction) {
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    maxsize: 1048576, // 1MB instead of 5MB
    maxFiles: 3
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    maxsize: 1048576, // 1MB
    maxFiles: 3
  }));
}

// Add performance monitoring
logger.performance = function(message, startTime) {
  if (!isProduction) {
    const duration = Date.now() - startTime;
    this.debug(`${message} - ${duration}ms`);
  }
};

module.exports = logger;