const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


// Function to generate a random verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// Function to send verification email
const sendVerificationEmail = async (email, token) => {
    console.log('Sending verification email..', process.env.EMAIL_USER, process.env.EMAIL_PASS)
    const transporter = nodemailer.createTransport({
        // Configure your email service provider settings here
        service: 'gmail',

        //! FOR DEVELOPMENT PURPOSES ONLY
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASS,
        },
    });

    const mailOptions = {
        from: 'Copilot',
        to: email,
        subject: 'Verify Your Email Address',
        html: `<h1>Email Verification</h1>
                <h2>Hello there!</h2>
                <p>Thank you for registering with Copilot. Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:8000/api/users/auth/verify/${token}">Verify Email</a>
                <p>If you did not register with Copilot, please ignore this email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendPasswordResetEmail = async (email, token) => {
    console.log('Sending password reset email..', process.env.EMAIL_USER, process.env.EMAIL_PASS)
    const transporter = nodemailer.createTransport({
        // Configure your email service provider settings here
        service: 'gmail',

        //! FOR DEVELOPMENT PURPOSES ONLY
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASS,
        },
    });

    const mailOptions = {
        from: 'Copilot',
        to: email,
        subject: 'Reset Your Password',
        html: `<h1>Password Reset</h1>
                <h2>Hello there!</h2>
                <p>We received a request to reset your password. Please reset your password by clicking the link below:</p>
                <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
}

module.exports = { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail };