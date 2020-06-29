const mongoose = require('mongoose');

const categoryScehma = new mongoose.Schema({
    CategoryKey: {
        type: String,
        required: true
    },
    Image: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    }
});

const category = mongoose.model('categories', categoryScehma);

module.exports = category;

/*
CategoryKey
Image
Description
*/