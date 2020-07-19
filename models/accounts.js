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
    availability: {
        type: String,
        required: true
    }, 
});

const accounts = mongoose.model('accounts', accountScehma);
module.exports = accounts;