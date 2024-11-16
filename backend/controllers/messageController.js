const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// * util function to check whether the user is there in the chat or not
const isUserParticipantInChat = async(userId, chatId) => {
    // Logic to check if the user is a participant in the chat
    const chat = await Chat.findById(chatId);
    return chat.users.includes(userId);
}

// * util function to check whether the Admin is there in the chat or not
const isUserAdminInChat = async(userId, chatId) => {
    // Logic to check if the user is a participant in the chat
    const chat = await Chat.findById(chatId).populate({
        path: 'users',
        match: { _id: userId },
        select: 'role'
    });

    if (!chat || chat.users.length === 0) {
        return false;
    }

    const user = chat.users[0];
    return user.role === 'project manager';
};

/**@send_message */
// send messages 

const sendMessage = asyncHandler(async(req,res) => {
    const {chatId, content, media} = req.body;
    if(!chatId || !content){
        return res.sendStatus(400).send({message: "Chat ID, Content are required"});
    }

    var chat = await Chat.findOne({_id: chatId});
    if(!chat){
        return res.sendStatus(404).send({message: "Chat not found"});
    }

    if (!await isUserParticipantInChat(req.user.id, chatId)) {
        return res.status(403).json({ message: 'You are not authorized to send a message in which youre not a part of' });
    }

    const containsLink = /https?:\/\/\S+/i.test(content); // Regex to detect links
    const status = containsLink ? 'pending' : 'approved';

    var messageData = {
        sender: req.user._id,
        chat: chatId,
        status: status,
        content: content,
        media: media,
    };

    try {
        const createdMessage = await Message.create(messageData);
        const fullMessage = await Message.findOne({ _id: createdMessage._id })
            .populate({
                path: "sender",
                select: "_id name email role"
            });

        // Update the latestMessage field of the chat
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: fullMessage._id
        });

        // Populate the chat field of the message
        await fullMessage.populate('chat');

        res.status(200).json(fullMessage);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to send a message" + error.message);
    }
});

/**@delete_message */
// delete a msg

const deleteMessage = asyncHandler(async(req, res) => {
    const {messageId, chatId} = req.body;
    if(!messageId || !chatId){
        console.log("Message ID, Chat ID required");
        return res.sendStatus(400);
    };

    if(req.user.role === "client" || req.user.role === "freelancer"){
        return res.status(403).json({ message: 'You are not authorized to delete a message' });
    }

    try {
        const message = await Chat.findOne({ _id: chatId, messages: { $in: [messageId] } });

        if (!message) {
            return res.status(404).send("Message not found in the chat");
        }
        
        await Message.findByIdAndDelete(messageId);
        res.status(200).json({message: `Message with ID ${messageId} deleted successfully`});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to delete a message" + error.message);
    }
});

/**@search_message_in_chat */
// search message in the chat

const searchMessage = asyncHandler(async (req, res) => {
    const { keyword, chatId } = req.params;
    if (!keyword || !chatId) {
        return res.status(400).send({ message: "Keyword and Chat ID required" });
    }
    try {
        // Find messages matching the keyword
        const messages = await Message.find({
            chat: chatId,
            content: { $regex: keyword, $options: "i" }
        }).lean();

        if (!messages.length) {
            return res.status(204).json({ message: 'No messages found' });
        }

        // Get the chat to retrieve user information
        const chat = await Chat.findById(chatId).populate('users', 'name').lean();

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Create a map of user IDs to names
        const userMap = chat.users.reduce((acc, user) => {
            acc[user._id.toString()] = user.name;
            return acc;
        }, {});

        // Simplify and add sender name to each message
        const simplifiedMessages = messages.map(message => ({
            _id: message._id,
            sender: message.sender,
            chat: message.chat,
            content: message.content,
            status: message.status,
            createdAt: message.createdAt,
            senderName: userMap[message.sender.toString()] || 'Unknown User'
        }));

        res.status(200).json(simplifiedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**@fetch_all_messages */
// fetch all messages in the chat

const allMessages = asyncHandler(async(req, res) => {
    try {
        if (!await isUserParticipantInChat(req.user.id, req.params.chatId)) {
            return res.status(403).json({ message: 'You are not authorized to see the messages of this chat 🤬' });
        }

        const messages = await Message.find({chat: req.params.chatId, status: { $ne: 'pending'}})
        .populate({
            path: "sender",
            select: "_id name email role"
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to fetch all messages" + error.message);
    }
});

/**@fetch_all_links */
// fetch all links in the chat

const viewLinks = asyncHandler(async(req, res) => {
    try {
        if (!await isUserAdminInChat(req.id, req.params.chatId)) {
            return res.status(403).json({ message: 'You are not authorized to see the messages' });
        }

        const messages = await Message.find({chat: req.params.chatId, status: 'pending'})
        .populate({
            path: "sender",
            select: "_id name email role"
        });
        if(messages.length === 0){
            res.status(200).json({message :"Empty, No Messages!!!"});
        }
        res.status(200).json(messages);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to fetch all messages" + error.message);
    }
});

/**@approve_link */
// approves the messages with link in the chat

const approveLinks = asyncHandler(async(req, res) => {
    try {
        if (!await isUserAdminInChat(req.user.id, req.params.chatId)) {
            return res.status(403).json({ message: 'You are not authorized to see the messages' });
        }
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        message.status = "approved";
        await message.save();
        res.status(200).json( {message : 'Message approved !!!'});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to approve the message " + error.message);
    }
});

/**@discard_link */
// deletes the messages with link in the chat 

const discardLinks = asyncHandler(async(req, res) => {
    try {
        if (!await isUserAdminInChat(req.user.id, req.params.chatId)) {
            return res.status(403).json({ message: 'You are not authorized to see the messages' });
        }
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.status !== 'pending') {
            return res.status(400).json({ message: 'Message is not in pending state' });
        }
        await Message.findByIdAndDelete(req.params.messageId);
        res.status(200).json( {message : 'Message discarded !!!'});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to discard the message " + error.message);
    }
});

module.exports = {sendMessage, deleteMessage, searchMessage, allMessages, viewLinks, approveLinks, discardLinks};