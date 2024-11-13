const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' }); // You can customize expiresIn as per your requirement
};

module.exports = generateToken;