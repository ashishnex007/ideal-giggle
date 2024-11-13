const mongoose = require('mongoose');

const transactionModel = mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionModel);