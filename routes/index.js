// Index Modules
const express = require('express');
const app = express()
const router = express.Router();
const mongoose = require('mongoose');

// Export Models
const category = require('../models/categories');
const products = require('../models/products');
const items = require('../models/items');
const accounts = require('../models/accounts');
const { db } = require('../models/categories');
const banners = require('../Management/models/banners')

const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(proccess.env.RECAPTCHA_SITE_KEY, proccess.env.RECAPTCHA_SECRET_KEY)

// Export Functions
const functions = require('../exports/functions');

var crypto = require("crypto")


//encryptData() to encrypt accounts table

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

router.get('/success', function(req, res) {
    try {
        if (req.session.viewOrder[0] && req.session.userInfo) {
            res.render('success.ejs', {purchaseContents: req.session.viewOrder, addressContents: req.session.userInfo})
        }
    } catch {
        res.redirect('/error')
    }
    
})


router.get('/products/:product/items/:items', function (req, res) {
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
            var total = functions.getTotal(result)
            res.render('basket.ejs', {
                items: result,
                total: total
            })
        }) 
    }
})

router.get('/paypal-test', recaptcha.middleware.render, function(req, res) {
    res.render('homepage.ejs')
})


// Export back to app.js
module.exports = router;