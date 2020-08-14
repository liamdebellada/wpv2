const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
});

const groups = mongoose.model('groups', groupSchema);

module.exports = groups;