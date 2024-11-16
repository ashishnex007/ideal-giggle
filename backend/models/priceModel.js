const mongoose = require("mongoose");

const priceSchema = mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    },{
        timestamps: true,
    }
);

const Price = mongoose.model("Price", priceSchema);
module.exports = Price;