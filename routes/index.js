// Index Modules
const express= require('express');
const router = express.Router();
const mongoose = require('mongoose');



// Export Models
const category  = require('../models/categories');
const products  = require('../models/products');
const items  = require('../models/items');
const { db } = require('../models/categories');



// Export Functions
const functions = require('../exports/functions');



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


router.get('/products/:product/items/:items', function (req, res) {
    console.log("Connected user session id:", req.session.id)
    var item = req.params.items.toString();
    var fallbackRedirect = '/products/' + req.params.product.toString();

    // Call searchQuery Function
    functions.searchQuery(res, items, 'ProductKey', item, 'items.ejs', fallbackRedirect);

})


// Export back to app.js
module.exports = router;