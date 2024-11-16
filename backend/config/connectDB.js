const express = require('express');
const mongoose = require('mongoose');
const deleteCronJob = require('../cron_jobs/delete_unverified_users');

require('dotenv').config();

const connectDB = () => {
    const dbConnectionString = process.env.DB_CONNECTION_STRING;
    
    mongoose.connect(dbConnectionString, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');

        // Run the cron job if the connection is successful
        // deleteCronJob();
    });
}

module.exports = connectDB;