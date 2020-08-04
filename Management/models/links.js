const mongoose = require('mongoose');

const linksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    }
});

const link = mongoose.model('Links', linksSchema);

module.exports = link;