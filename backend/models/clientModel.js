const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema(
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      UID: String,
      name: String,
      email: String,
      role: String,
      active_projects: [mongoose.Schema.Types.ObjectId],
      total_projects: Number,
      verificationToken: String,
      resetToken: String,
      verified: Boolean,
      adminVerified: Boolean,
      isSuspended: Boolean,
      createdAt: Date,
      updatedAt: Date,
    },
    { _id: false }
);

const ClientSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        description: String,
        requirements: String,
        skillset: [String], // * the skills he is looking for
        domains: [String], // * the domains he works with

        phoneNumber: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },

        portfolios: [String], // * his portfolios
        businesses: String, // * his businesses

        GSTInvoice: String, // * option in profile not during registration
        
        transactions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
        }],
        credits: {
            type: Number,
            default: 0,
        },
        manager: {
            type: [ManagerSchema],
            maxlength: 2,
        },
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Client", ClientSchema);