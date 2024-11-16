const mongoose = require('mongoose');
const { z } = require('zod');

const userSchema = mongoose.Schema(
    {
        UID: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String, 
            required: true
        },
        email: {
            type: String, 
            unique: true,
            required: true
        },
        password: {
            type: String, 
            required: true
        },
        role:{
            type: String,
            required: true,
        },
        active_projects:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project"
            }
        ],
        total_projects:{
            type: Number,
            default: 0
        },
        verificationToken: {
            type: String,
            default: null
        },
        resetToken: {
            type: String,
            default: null
        },
        verified: {
            type: Boolean,
            default: false
        },
        adminVerified: {
            type: Boolean,
            default: false
        },
        isSuspended: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

// Define Zod schema for user validation
const userZodSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["freelancer", "client"]),
});

// Validate user data using Zod schema
function validateUser(data) {
    try {
        userZodSchema.parse(data);
        return true;
    } catch (error) {
        console.error("Validation Error:", error);
        return false;
    }
}

module.exports = { User, validateUser };
