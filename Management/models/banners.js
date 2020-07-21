const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    textColor: {
        type: String,
        required: false
    },
    additionalInfo: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

const banners = mongoose.model('banners', bannerSchema);

module.exports = banners;