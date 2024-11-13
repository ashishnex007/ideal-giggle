const mongoose = require('mongoose');

const proposalSchema = mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer",
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        required: true
    },
    projectRole: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["unapproved", "accepted", "rejected"],
        default: "unapproved"
    }
    }, 
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Proposal", proposalSchema);