const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    projectId: { // * we need this only for group chats, DMs have nothing to do with project link
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Project",
    },
    chatName: {
        type: String,
        required: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    users: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        },
    ],
    latestMessage: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Message",
    },
    groupAdmin: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
    }
},
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;