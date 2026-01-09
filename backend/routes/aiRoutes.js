const express = require('express');
const { askCipherGateAI } = require('../controllers/aiController');
const router = express.Router();

// AI-powered chat endpoint
router.post('/ask', askCipherGateAI);

module.exports = router;