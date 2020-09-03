const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/worldPlugs', { useNewUrlParser: true, useUnifiedTopology: true} ).then(res => {}).catch(err => {})

const categoryScehma = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    Title: {
        type: String,
        required: true
    },
    CategoryKey: {
        type: String,
        required: true
    },
    Image: {
        type: String,
        required: true
    },
    DisplayPopular: {
        type: String,
        required: true
    },
});

const category = mongoose.model('categories', categoryScehma);
module.exports = category;