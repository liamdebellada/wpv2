const mongoose = require('mongoose');

const manUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
});

const managementUsers = mongoose.model('managementUsers', manUserSchema);
module.exports = managementUsers;