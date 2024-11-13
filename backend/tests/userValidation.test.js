const { validateUser } = require('../models/userModel'); // Adjust the path according to your file structure

// Mock user data for testing
const validUserData = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    role: "client",
};

const invalidUserData = {
    // Missing 'email' field
    name: "Jane Doe",
    password: "password456",
    role: "freelancer",
};

describe('User Validation', () => {
    test('Valid user data should pass validation', () => {
        expect(validateUser(validUserData)).toBe(true);
    });

    test('Invalid user data should fail validation', () => {
        expect(validateUser(invalidUserData)).toBe(false);
    });
});
