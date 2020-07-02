const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    session: {
        type: Object,
        required: true
    }
});

const session = mongoose.model('Session', sessionSchema, "Session");

module.exports = session;

