const mongoose = require('mongoose');

const accountScehma = new mongoose.Schema({
    itemID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avaliability: {
        type: String,
        required: true
    }
});

const category = mongoose.model('accounts', accountScehma);
module.exports = category;