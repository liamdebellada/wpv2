// Index Modules
const express = require('express');
const app = express()
const router = express.Router();
const mongoose = require('mongoose');



// Export Models
const category = require('../models/categories');
const products = require('../models/products');
const items = require('../models/items');
const { db } = require('../models/categories');


// Export Functions
const functions = require('../exports/functions');





//style testing page
router.get('/style', function(req, res) {
    res.render('testing.ejs')
})


// Pages

router.get('/', (req, res) => {
    // Call searchQuery Function
    functions.searchQuery(res, category, '', '', 'homepage.ejs');

})


router.get('/products/:product', function (req, res) {

    // Incl data sanitization here
    var product = req.params.product.toString();

    // Call searchQuery Function
    functions.searchQuery(res, products, 'CategoryKey', product, 'products.ejs');


})


router.get('/products/:product/items/:items',  function (req, res) {
    var item = req.params.items.toString();
    var fallbackRedirect = '/products/' + req.params.product.toString();

    // Call searchQuery Function
    functions.searchQuery(res, items, 'ProductKey', item, 'items.ejs', fallbackRedirect);

})

router.get('/cart', function(req, res) {
    if (req.session.cart === undefined) {
        functions.errorHandler(res, "Please visit the store before viewing the basket")
    } else {
        if (req.session.cart.length < 1) {
            functions.errorHandler(res, "Your basket is empty")
        }
        functions.getBasket(req.session.cart, items, function(result) {
            var total = 0;
            result.forEach(function(row) {
                var item = row[0]
                total = total + parseInt(item.Price)
            })
            res.render('basket.ejs', {
                items: result,
                total: total
            })
        }) 
    }
})


// Export back to app.js
module.exports = router;