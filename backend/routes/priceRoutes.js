const express = require('express');
const router = express.Router();
const { setPrice, updatePrice, getPrice } = require('../controllers/priceController');
const {protect} = require("../middlewares/authMiddleware");

// Route to set a new price
router.post('/set', protect, setPrice);

// Route to update an existing price
router.put('/update', protect, updatePrice);

// Route to get a price by category and difficulty
router.get('/:category/:difficulty', protect, getPrice);

module.exports = router;