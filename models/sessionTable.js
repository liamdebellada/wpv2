const mongoose = require('mongoose');



mongoose.connect('mongodb://localhost:27017/worldPlugs', { useNewUrlParser: true, useUnifiedTopology: true} ).then(res => res).catch(err => err)

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

const session = mongoose.model('Sessions', sessionSchema, 'Sessions');
//session.find({}).then(res => console.log("models", res)).catch(err => console.log(err))

module.exports = session;

