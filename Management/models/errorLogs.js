const mongoose = require('mongoose');

const errorLogsSchema = new mongoose.Schema({
    Date: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    }
});

const errorlog = mongoose.model('errorlogs', errorLogsSchema);

module.exports = errorlog;