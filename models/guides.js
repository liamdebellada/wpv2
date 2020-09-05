const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/worldPlugs', { useNewUrlParser: true, useUnifiedTopology: true} ).then(res => {}).catch(err => {})

const guideSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    CreationDate: {
        type: String,
        required: true
    },
    GuideLink: {
        type: String,
        required: true
    },
    Content: {
        type: String,
        required: true
    },
    Pinned: {
        type: String,
        required: true
    },
    ProductLink: {
        type: String,
        required: true
    },
    ProductUrlTitle: {
        type: String,
        required: true
    }
});

const guides = mongoose.model('guides', guideSchema);
module.exports = guides;