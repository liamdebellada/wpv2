const mongoose = require('mongoose');

const productsScehma = new mongoose.Schema({
    CategoryKey: {
        type: String,
        required: true
    },
    ProductKey: {
        type: String,
        required: true
    },
    Title: {
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

const products = mongoose.model('products', productsScehma);

module.exports = products;

/*
CategoryKey
Image
Description
*/