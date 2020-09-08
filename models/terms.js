const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    title : {
        type: String,
        required: false
    },
    contentKey: {
        type: String, 
        required: false
    },
    content: {
        type: String,
        required: false
    }
});

const terms = mongoose.model('terms', termsSchema);

module.exports = terms;