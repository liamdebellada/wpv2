const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
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
    }
});

const item = mongoose.model('items', itemSchema);

module.exports = item;