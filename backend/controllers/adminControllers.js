const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const {User} = require("../models/userModel");
const Client = require("../models/clientModel");
const ProjectManager = require('../models/projectManagerModel');

// * approve user
const approveUser = asyncHandler(async(req, res) => {
    const {userId} = req.body;

    if(!userId){
        return res.status(400).json({message: "User ID required for access"});
    }

    if(req.user.role !== "admin"){
        return res.status(401).json({message: "You are not authorized to approve users"});
    }

    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        user.adminVerified = true;
        await user.save();

        res.status(200).json({message: "User approved successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});
 
// * suspend user
const suspendUser = asyncHandler(async(req, res) => {
    const {userId} = req.body;

    if(!userId){
        return res.status(400).json({message: "User ID required for access"});
    }

    if(req.user.role !== "admin"){
        return res.status(401).json({message: "You are not authorized to suspend users"});
    }

    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        user.isSuspended = true;
        await user.save();

        res.status(200).json({message: "User suspended successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});

// * remove suspension
const resumeUser = asyncHandler(async(req, res) => {
    const {userId} = req.body;

    if(!userId){
        return res.status(400).json({message: "User ID required for access"});
    }

    if(req.user.role !== "admin"){
        return res.status(401).json({message: "You are not authorized to suspend users"});
    }

    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        user.isSuspended = false;
        await user.save();

        res.status(200).json({message: "User resumed successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});

// * create new project manager
const createProjectManager = asyncHandler(async(req, res) => {
    const {UID, email, password, name, phoneNumber, address, languages, domains} = req.body;

    if(req.user.role !== "admin"){
        return res.status(401).json({message: "You are not authorized to create project managers"});
    }

    try {
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({message: "User with this email already exists"});
        }

        user = new User({
            UID,
            name,
            email,
            password,
            role: "project manager",
            adminVerified: true,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const projectManager = new ProjectManager({
            userId: user._id,
            phoneNumber: phoneNumber,
            address: address, 
            languages: languages, 
            domains: domains,
        });

        await projectManager.save();

        res.status(201).json({message: "Project Manager created successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});

// * Assign Manager to a Client
const assignManager = asyncHandler(async(req, res) => {
    const {clientId, managerId, type} = req.body;

    if(req.user.role !== "admin"){
        return res.status(401).json({message: "You are not authorized to assign managers"});
    }

    try {
        const client = await Client.findOne({userId: clientId});

        if(!client){
            return res.status(404).json({message: "Client not found"});
        }

        console.log(client.manager);

        // Check if manager field exists and initialize if undefined
        if (!client.manager) {
            client.manager = [];
        }

        const manager = await ProjectManager.findOne({userId: managerId});

        if(!manager){
            return res.status(404).json({message: "Manager not found or is not a project manager"});
        }

        // Add manager based on the type (primary or secondary)
        if (type === 'primary') {
            if (client.manager[0]) {
                return res.status(400).json({ message: "Primary manager already exists." });
            }
            client.manager[0] = managerId;  // Assign as primary manager
        } else if (type === 'secondary') {
            if (client.manager[1]) {
                return res.status(400).json({ message: "Secondary manager already exists." });
            }
            client.manager[1] = managerId;  // Assign as secondary manager
        } else {
            return res.status(400).json({ message: "Invalid manager type specified." });
        }

        // Update the clients array in the ProjectManager object
        if (!manager.clients.includes(clientId)) {
            manager.clients.push(clientId);
        }

        await client.save();
        await manager.save();
        
        console.log(client);
        console.log(manager);

        res.status(200).json({message: "Manager assigned successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
});

// * update manager
const assignOrUpdateManager = asyncHandler(async (req, res) => {
    const { clientId, managerObj, type } = req.body;

    if (req.user.role !== "admin") {
        return res.status(401).json({ message: "You are not authorized to assign or update managers" });
    }

    try {
        const client = await Client.findOne({ userId: clientId });

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Initialize manager array if it doesn't exist
        if (!client.manager) {
            client.manager = [];
        }

        const manager = await ProjectManager.findOne({ userId: managerObj._id });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found or is not a project manager" });
        }

        let oldManagerId;

        // Assign or update manager based on the type (primary or secondary)
        if (type === 'primary') {
            oldManagerId = client.manager[0];
            client.manager[0] = managerObj;
        } else if (type === 'secondary') {
            oldManagerId = client.manager[1];
            client.manager[1] = managerObj;
        } else {
            return res.status(400).json({ message: "Invalid manager type specified." });
        }

        // Remove client from old manager's clients array (if exists)
        if (oldManagerId) {
            const oldManager = await ProjectManager.findOne({ userId: oldManagerId });
            if (oldManager) {
                oldManager.clients = oldManager.clients.filter(id => id.toString() !== clientId);
                await oldManager.save();
            }
        }

        // Add client to new manager's clients array (if not already there)
        if (!manager.clients.includes(clientId)) {
            manager.clients.push(clientId);
        }

        await client.save();
        await manager.save();

        res.status(200).json({ 
            message: oldManagerId ? "Manager updated successfully" : "Manager assigned successfully",
            client
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = {
    approveUser,
    suspendUser,
    resumeUser,
    createProjectManager,
    assignManager,
    assignOrUpdateManager,
}