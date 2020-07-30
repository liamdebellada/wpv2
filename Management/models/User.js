const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    ECAUID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    uid: {
        type: Number,
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
    date: {
        type: Date,
        default: Date.now
    },
    group: {
        type: String,
        required: true
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;