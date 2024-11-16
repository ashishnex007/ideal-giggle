const express = require('express');
const router = express.Router();
const { sendNotification, getNotifications } = require('../controllers/notificationController');
const {protect} = require('../middlewares/authMiddleware');

// Route to send a new notification (admin only)
router.post('/send', protect, sendNotification);
// Route to get notifications based on user role
router.get('/', protect, getNotifications);

module.exports = router;