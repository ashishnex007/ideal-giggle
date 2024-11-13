const Notification = require('../models/notificationModel');

// Controller function to send a new notification (admin only)
const sendNotification = async (req, res) => {
  const { title, description, target } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const newNotification = new Notification({ title, description, target });
    await newNotification.save();
    res.status(201).json({ message: 'Notification sent successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller function to get notifications based on user role
const getNotifications = async (req, res) => {
    const userRole = req.user.role;
    try {
      let query;
      if (userRole === 'admin') {
        // Admins can see all notifications
        query = {};
      } else {
        // Other users can only see notifications targeted to their role or 'all'
        query = { target: { $in: [userRole, "all"] } };
      }
  
      const notifications = await Notification.find(query).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { sendNotification, getNotifications };