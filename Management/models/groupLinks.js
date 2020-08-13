const mongoose = require('mongoose');

const groupLinksSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    URL: {
        type: String,
        required: true
    },
    Ranks: {
        type: Array,
        required: true
    }
});

const grouplinks = mongoose.model('grouplinks', groupLinksSchema);

module.exports = grouplinks;