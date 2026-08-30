const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const models = require('../models');

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    message: 'Digital Skill Passport Backend API is running',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'n/a',
      host: mongoose.connection.host || 'n/a',
      registeredModels: Object.keys(models),
    },
    version: '1.0.0'
  });
});

module.exports = router;
