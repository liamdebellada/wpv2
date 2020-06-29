// App Modules
const express= require('express');
const router = express.Router();
const app = express();

const mongoose = require('mongoose')

// Models
const category  = require('../models/categories');
const products  = require('../models/products');
const items  = require('../models/items');
const { db } = require('../models/categories');


// Pages
router.get('/', (req, res) => {
    categories = []

    category.find({
        
    }).then(categories => {
        res.render('homepage.ejs', {
            categories: categories
        })

    })
    .catch(categories => {
        console.log("")
    })
})

router.get('/product', function (req, res) {
    res.render('products.ejs')
})

router.get('/item', function (req, res) {
    res.render('items.ejs')
})


router.post('/getproducts', function (req, res) {
    const categoryKey = req.body.categoryKey
    
    req.app.io.to(req.body.socketid).emit('messages', categoryKey);

})

router.post('/updateProducts', function(req, res) {
    categoryKey = req.body.data.split("?")[1]
    requestedProduct = []

    products.find({
        CategoryKey: categoryKey
    }).then(requestedProduct => {
        req.app.io.to(req.body.socketid).emit('messages', requestedProduct);
    })
    .catch(requestedProduct => {
        console.log("error")
    })

})

router.post('/getitems', function (req, res) {
    itemKey = req.body.itemKey.split("?")[1]
    console.log(req.body.socketid)
    requestedItems = []
    items.find({
        ProductKey: itemKey
    }).then(requestedItems => {
        console.log(requestedItems)
        req.app.io.to(req.body.socketid).emit('messages', requestedItems);
    })
    .catch(requestedItems => {
        console.log("error")
    })

})


// Export back to app.js
module.exports = router;