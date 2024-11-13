const express = require("express");
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { addCredits, removeCredits, orders, success, getTransactions } = require('../controllers/creditController');

//credit operations 
router.route('/addCredits').post(protect, addCredits);
router.route('/removeCredits').post(protect, removeCredits);
router.route('/orders').post(orders);
router.route('/success').post(success);
router.route('/getTransactions/:userId').get(getTransactions);

module.exports = router;