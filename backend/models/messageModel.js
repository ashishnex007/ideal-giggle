const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true
        },
        chat: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Chat",
            required: true
        },
        content: {
            type: String,
            trim: true
        },
        media: {
            type: String,
        },
        status : { // * If it contains links
            type: String, 
            enum: ["approved", "pending"],
            default: "approved"
        }
    },
    {
        timestamps: true,
    }
)

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;