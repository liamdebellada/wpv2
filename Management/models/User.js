const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    ECAUID: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    uid: {
        type: Number,
        required: false
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
    requirePasswordChange: {
        type: [String],
        required: true
    },
    secret: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;