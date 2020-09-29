const mongoose = require('mongoose')

const successOrdersSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    purchaseData: {
        type: Object,
        required: true
    },
    createdAt: { type: Date, expires: '30m', default: Date.now }
})

const successOrders = mongoose.model('successOrders', successOrdersSchema)
module.exports = successOrders;
