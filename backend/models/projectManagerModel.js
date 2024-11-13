const mongoose = require('mongoose');

const projectManagerSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        languages: {
            type: [String],
            required: true,
        },
        domains: {
            type: [String],
            required: true,
        },
        clients : {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        },
    }, 
    {
        timestamp: true
    }
);

module.exports = mongoose.model("ProjectManager", projectManagerSchema);