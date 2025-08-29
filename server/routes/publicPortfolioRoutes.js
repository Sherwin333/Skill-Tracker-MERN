// server/routes/publicPortfolioRoutes.js
const express = require('express');
const {
    getPublicPortfolio,
    updatePublicPortfolioSettings
} = require('../controllers/publicPortfolioController');
const auth = require('../middleware/authMiddleware'); // Our custom auth middleware for updating settings

const router = express.Router();

// Public route to view a portfolio
router.get('/:publicPortfolioId', getPublicPortfolio); // No 'auth' middleware here!

// Private route to update public portfolio settings by the authenticated user
router.put('/settings', auth, updatePublicPortfolioSettings);

module.exports = router;