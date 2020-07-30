const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
    Date: {
        type: String,
        required: true
    },
    OrderID: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Amount: {
        type: String, 
        required: true
    },
    Accounts: {
        type: Array,
        required: true
    }
});

const log = mongoose.model('logs', logsSchema);

module.exports = log;