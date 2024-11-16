const mongoose = require('mongoose');

const freelancerSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        bio: String,
        education:{
            type: [String],
            required: true,
        },
        experience: [String],
        portfolios:{
            type: [String],
            required: true,
        },
        servicesList:{
            type: [String],
            required: true,
        },
        skills:{
            type: [String],
            required: true,
        },
        languages:{
            type: [String],
            required: true,
        },
        transactions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
        }],
        credits: {
            type: Number,
            default: 0,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Freelancer", freelancerSchema);