const Chat = require("../models/chatModel");
const {User} = require("../models/userModel");
const asyncHandler = require("express-async-handler");

/**@chat_1on1 */
// this function will create a new chat

const createChat = asyncHandler(async(req,res) => {
    const {userId, chatName} = req.body; // * get the chat name from the request body

    if(!userId){
        console.log("User ID required for access");
        return res.sendStatus(400);
    }

    if(!chatName){
        return res.sendStatus(400).json({message: "Please provide a chat name for new chat."});
    }
    
    try {
        const requestingUser = await User.findById(req.user._id);
        const targetUser = await User.findById(userId);

        if(!targetUser){
            return res.sendStatus(404).json({message: "User not found"});
        }

        const validMessage = (requestingUserRole, targetUserRole) => {
            const allowedRoles = {
                admin: ["freelancer", "client", "project manager", "admin"],
                "project manager": ["freelancer", "client", "project manager", "admin"],
                client: ["project manager", "admin"],
                freelancer: ["project manager", "admin"],
            };

            return allowedRoles[requestingUserRole].includes(targetUserRole);
        };

        if(!validMessage(requestingUser.role, targetUser.role)) {
            return res.status(404).json({message: "You are not allowed to message this user"});
        }

        // * create a new chat
        const chatData = {
            chatName: chatName,
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({_id: createdChat._id})
        .populate({
            path: "users",
            select: "_id name email role active_projects total_projects",
        })
        res.status(200).json(FullChat);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to create a new Chat" + error.message);
    }
});

/** @create_group_chat */
// create a new group chat

const groupChat = asyncHandler(async(req, res) => {
    if(!req.body.users || !req.body.name){
       return res.status(400).send({message: "please fill all the fields"}); 
    }

    if(!req.body.projectId){
       return res.status(400).send({message: "project ID is required to create a new group chat"}); 
    }

    const groupCreator = await User.findById(req.user);

    // * clients and freelancers are not allowed to create group chats

    if(groupCreator.role === "client" || groupCreator.role === "freelancer"){ 
        return res.status(400).send({message: "You are not allowed to create a group chat"});
    }

    var users = JSON.parse(req.body.users);

    // * at least one user cuz the creator and this guy will make it 2 users
    if(users.length < 1){ 
        return res.status(400).send({message: "more than two needed in the group"});
    }

    users.push(groupCreator._id); // * add the creator to the group (group admin)
    users.push(req.users);

    try {
        const groupChat = await Chat.create({
            projectId: req.body.projectId,
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: groupCreator._id,
        });
        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate({
            path: "users",
            select: "_id name email role active_projects assigned_manager total_projects",
        })
        .populate({
            path: "groupAdmin",
            select: "_id name email role active_projects total_projects",
        });
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to create a new Group" + error.message);
    }
});

/** @fetch_all_chats */
// fetches all chats of a user

const fetchChats = asyncHandler(async(req, res) => {
    try{
        Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({updatedAt: -1})
            .then(async(results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "_id role email"
            });
            res.status(200).json(results);
        })
    }catch(error){
        res.status(400);
        throw new Error("Failed to fetch chats" + error.message);
    }
});

/** @access_a_chat */
// access a chat (personal or group chat with chatId)
const accessChat = asyncHandler(async(req, res) => {
    const chatId = req.params.chatId;

    if(!chatId){
        return res.status(400).send({message: "Please fill all the chatId"});
    }

    try {
        const chat = await Chat.findById(chatId)
        .populate("users", "name email role active_projects total_projects")
        .populate("groupAdmin", "name email role active_projects total_projects");

        if(!chat){
            return res.status(400).send({message: "Chat not found"});
        }
        res.status(200).json(chat);
    } catch (error) {
        res.status(400);
        throw new Error("Failed to access the chat" + error.message);
    }
});

/** @add_user_to_group */
// add users to group chat

const addToGroup = asyncHandler(async(req, res) => {
    const {chatId, userId} = req.body;

    if(!chatId || !userId){
        return res.status(400).send({message: "Please fill all the fields"});
    }

    if(req.user.role === "client" || req.user.role === "freelancer"){
        return res.status(400).send({message: "Only admins and PMs can add users to group"});
    }

    try {
        const chat = await Chat.findOne({_id: chatId});
        if(!chat){
            return res.status(400).send({message: "Chat not found"});
        }

        if(chat.users.includes(userId)){
            return res.status(400).send({message: "User already in the chat"});
        }

        chat.users.push(userId);
        await chat.save();
        res.status(200).send({message: "Users added successfully"});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to add users to chat" + error.message);
    }
});

/** @remove_user_from_group */
// remove user from group chat

const removeFromGroup = asyncHandler(async(req, res) => {
    const {chatId, userId} = req.body;

    if(!chatId || !userId){
        return res.status(400).send({message: "Please fill all the fields"});
    }

    if(req.user.role === "client" || req.user.role === "freelancer"){
        return res.status(400).send({message: "Only admins and PMs can remove users from group"});
    }

    try {
        const chat = await Chat.findOne({_id: chatId});
        if(!chat){
            return res.status(400).send({message: "Chat not found"});
        }

        // Check if the user is in the group
        if (!chat.users.includes(userId)) {
            return res.status(400).send({ message: "User is not in the group" });
        }

        // remove the user from the group
        chat.users = chat.users.filter((id) => id != userId);
        await chat.save();
        res.status(200).send({message: "User removed successfully"});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to remove user from chat" + error.message);
    }
});

/** @delete_group_chat */
// delete group chat

const deleteGroupChat = asyncHandler(async(req,res) => {
    const {chatId} = req.body;

    if(!chatId){
        return res.status(400).send({message: "Please add the group ID"});
    }

    if(req.user.role === "client" || req.user.role === "freelancer"){
        return res.status(400).send({message: "Only admins and PMs can delete group chat"});
    }

    try {
        const chat = await Chat.findOne({_id: chatId});
        if(!chat){
            return res.status(400).send({message: "Group doesn't exist"});
        }

        // * Only that group admin can delete the group
        if(chat.groupAdmin.toString() !== req.user._id.toString()){
            return res.status(400).send({message: "You are not the admin of this group"});
        }

        await Chat.deleteOne({_id: chatId});
        res.status(200).send({message: "Chat deleted successfully"});
    } catch (error) {
        res.status(400);
        throw new Error("Failed to delete chat" + error.message);
    }
});

module.exports = {
    createChat,
    groupChat,
    fetchChats,
    accessChat,
    addToGroup,
    removeFromGroup,
    deleteGroupChat,
}