const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/worldPlugs', { useNewUrlParser: true, useUnifiedTopology: true} )
const categoryScehma = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    CategoryKey: {
        type: String,
        required: true
    },
    Image: {
        type: String,
        required: true
    }
});

const category = mongoose.model('categories', categoryScehma);
module.exports = category;