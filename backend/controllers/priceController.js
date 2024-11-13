const Price = require('../models/priceModel');

// Controller function to get a price by category and difficulty
const getPrice = async (req, res) => {
  const { category, difficulty } = req.params;
  // console.log(category, difficulty);

  if(!req.user){
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  try {
    const price = await Price.findOne({ category, difficulty });
    
    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.status(200).json(price);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller function to set a new price
const setPrice = async (req, res) => {
  const { category, difficulty, price } = req.body;

  if(req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const newPrice = new Price({ category, difficulty, price });
    await newPrice.save();
    res.status(201).json({ message: 'Price set successfully', price: newPrice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller function to update an existing price
const updatePrice = async (req, res) => {
  const { category, difficulty, price } = req.body;

  if(req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const existingPrice = await Price.findOne({ category, difficulty });
    if (!existingPrice) {
      return res.status(404).json({ message: 'Price not found' });
    }

    existingPrice.price = price;
    await existingPrice.save();
    res.status(200).json({ message: 'Price updated successfully', price: existingPrice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { setPrice, updatePrice, getPrice };