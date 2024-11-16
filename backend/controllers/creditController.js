require("dotenv").config();
const Client = require("../models/clientModel");
const Freelancer = require("../models/freelancerModel");
const Transaction = require("../models/transactionModel");
const asyncHandler = require('express-async-handler');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const { User } = require("../models/userModel");

const orders = asyncHandler(async(req, res) => {
    try {
        const { totalBill } = req.body;

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: Math.round(totalBill * 100), // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_" + Date.now(), // order receipt number
        };

        const order = await instance.orders.create(options);
        if (!order) return res.status(500).json({ msg: "Some error occurred" });
        res.status(200).json(order);
    } catch (error) {
        console.error("Error in creating order:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});

const success = asyncHandler(async(req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Logging for debugging
        console.log('Received payment verification request:', {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature
        });

        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            console.log('Signature verification failed');
            return res.status(400).json({ msg: "Transaction not legit!" });
        }

        console.log('Signature verified successfully');

        res.status(200).json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.error('Error in payment verification:', error);
        res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});


const addCredits = asyncHandler(async(req, res) => {
    // const {numCredits, userId, role} = req.body;
    const {numCredits, userId, role, razorpayPaymentId} = req.body; // this userId represents client id / freelancer id
    
    if(!numCredits){
        return res.status(400).json({ message: 'Number of credits is required' });
    }
    
    if(role === "client"){
        const client = await Client.findById(userId);
        if(client) {
            client.credits += numCredits;

            // Create a new transaction
            const newTransaction = await Transaction.create({
                transactionId: razorpayPaymentId,
                userId: client.userId,
                type: 'credit',
                amount: numCredits,
            });

            // Add the transaction to the client
            client.transactions.push(newTransaction);
            await client.save();
            return res.status(200).json({ message: 'Credits added successfully' });
        }
    }

    if(role === "freelancer"){
        const freelancer = await Freelancer.findOne({userId: userId});
        try {
            if(freelancer) {
                freelancer.credits += numCredits;

                // Create a new transaction
                const newTransaction = await Transaction.create({
                    transactionId: uuidv4(),
                    userId: freelancer.userId,
                    type: 'credit',
                    amount: numCredits,
                });

                // Add the transaction to the freelancer
                freelancer.transactions.push(newTransaction);
                await freelancer.save();
                console.log(freelancer);
                // console.log(freelancer.transactions);
                return res.status(200).json({ message: 'Credits added successfully' });
            }else{
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.log(error);
        }
    }

    return res.status(404).json({ message: 'User not found or not eligible for this operation' });
});

const removeCredits = asyncHandler(async(req, res) => {
    const {numCredits, userId} = req.body;
    if(!numCredits){
        return res.status(400).json({ message: 'Number of credits is required' });
    }
    
    const client = await Client.findOne({userId: userId});
    if(client) {
        if(client.credits < numCredits) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }
        client.credits -= numCredits;

        // Create a new transaction
        const newTransaction = await Transaction.create({
            transactionId: uuidv4(),
            userId: client.userId,
            type: 'debit',
            amount: numCredits,
        });
        
        // // add the transaction to the client
        client.transactions.push(newTransaction);
        await client.save();
        return res.status(200).json({ message: 'Credits removed successfully' });
    }

    const freelancer = await Freelancer.findOne({userId: userId});
    if(freelancer) {
        if(freelancer.credits < numCredits) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }
        freelancer.credits -= numCredits;

        // Create a new transaction
        const newTransaction = await Transaction.create({
            transactionId: uuidv4(),
            userId: freelancer.userId,
            type: 'debit',
            amount: numCredits,
        });

        // add the transaction to the freelancer
        freelancer.transactions.push(newTransaction);
        await freelancer.save();
        return res.status(200).json({ message: 'Credits removed successfully' });
    }

    return res.status(404).json({ message: 'User not found or not eligible for this operation' });
});

const getTransactions = asyncHandler(async(req, res) => {
    const {userId} = req.params;

    const user = await User.findById(userId);
    if(!user){
        return res.status(400).json({message: "User not found" });
    }
    
    // descending order
    const transactions = await Transaction.find({ userId: userId}).sort({createdAt: -1});
    if(!transactions){
        return res.status(404).json({message: "No transactions found for this user"});
    }
    res.json(transactions);
});

module.exports = {addCredits, removeCredits, orders, success, getTransactions};