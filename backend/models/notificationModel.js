const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    target: [
        {
            type: String,
            required: true,
        }
    ],
},
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;