const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel');

// checks if token is available, to know if user is logged in or not

// No token -> req.user = null
// Token -> req.user = user object

const protect = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from headers
        const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ?
            req.headers.authorization.split(' ')[1] : null;  

        if (!token) {
            req.user = null; // Assign null to req.user if no token
            next(); // Move to next middleware without assigning user
            return;
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by decoded user ID from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // id not found in database
        }

        // Assign user to req.user
        req.user = user;

        next(); // Move to next middleware
    } catch (error) {
        console.error('Error assigning role:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please log in again' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

module.exports = {protect};