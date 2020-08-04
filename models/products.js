const mongoose = require('mongoose');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching-v2');

const productsScehma = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
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
    },
    productState: {
        type: String,
        required: true
    },
});

productsScehma.plugin(mongoose_fuzzy_searching, {
    fields: ["Title", "ProductKey", "CategoryKey"]
});

const products = mongoose.model('products', productsScehma);

module.exports = products;

/*
CategoryKey
Image
Description
*/