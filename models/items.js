const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    ProductKey: {
        type: String,
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Price: {
        type: String,
        required: true
    },
    Stock: {
        type: String,
        required: true
    },
});

const item = mongoose.model('items', itemSchema);

module.exports = item;