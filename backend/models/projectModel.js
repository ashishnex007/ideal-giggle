const mongoose = require('mongoose');
const {User} = require("./userModel");

const projectSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        skills: {
            type: [String],
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        deadline: {
            type: Date,
            required: true
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true
        },
        clientName: {
            type: String,
            required: true
        },
        assignedManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        freelancers: [
            {
                freelancer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Freelancer"
                },
                role: {
                    type: String,
                }
            }
        ],
        status: { // * project status
            type: String,
            enum: [ "unapproved", "open", "ongoing", "completed", "rejected"], 
            default: "unapproved"
        },
        proposals: [
            {
                freelancer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Proposal"
                },
                status: {
                    type: String,
                    enum: ["unapproved", "accepted", "rejected"],
                    default: "unapproved"
                }
            }
        ],
    },
    {
        timestamps: true
    }
);

projectSchema.pre('save', async function (next) {
    if (this.isModified('status') && this.status === 'completed') {
        await User.updateOne(
            { _id: this.client },
            {
                $pull: { active_projects: this._id },
                $inc: { total_projects: 1 }
            }
        );

        await User.updateOne(
            { _id: this.manager },
            {
                $pull: { active_projects: this._id },
                $inc: { total_projects: 1 }
            }
        );
    }
    next();
});

module.exports = mongoose.model("Project", projectSchema);