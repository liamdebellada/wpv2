// Index Modules
const express = require('express');
const app = express()
const router = express.Router();
const mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching-v2');

// Export Models
const category = require('../models/categories');
const products = require('../models/products');
const items = require('../models/items');
const accounts = require('../models/accounts');
const { db } = require('../models/categories');
const banners = require('../Management/models/banners')

const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

// Export Functions
const functions = require('../exports/functions');

var crypto = require("crypto")


//encryptData() to encrypt accounts table

// Pages


router.get('/', (req, res) => {
    // Call searchQuery Function
    req.session.errorMsg = ""
    functions.searchQuery(res, category, '', '', 'homepage.ejs');

})

router.get('/products/:product', function (req, res) {

    // Incl data sanitization here
    var product = req.params.product.toString();

    // Call searchQuery Function
    functions.searchQuery(res, products, 'CategoryKey', product, 'products.ejs');


})


router.post('/searchData', function(req, res) {
    var query = sanitize(req.body.searchQuery)
    if (query == "") {
        res.send("Cant find what your looking for? Request an item in our discord!")
    } else {
        products.fuzzySearch(query, function(err, results) {
            if (err) {
                console.error(err);
            } else {
                if (results.length < 1) {
                    res.send("WorldPlugs couldnt find what you are looking for :(")
                } else {
                    res.send(results)
                }
            }
        });
    }

})

router.get('/success', function(req, res) {
    try {
        if (req.session.viewOrder[0] && req.session.userInfo) {
            res.render('success.ejs', {purchaseContents: req.session.viewOrder, addressContents: req.session.userInfo})
        }
    } catch {
        res.redirect('/')
    }
    
})


router.get('/products/:product/items/:items', async function (req, res) {
    var item = req.params.items.toString();
    var category = req.params.product.toString();
    var fallbackRedirect = '/products/' + req.params.product.toString();

    await products.findOne({CategoryKey: category, ProductKey: item}, function(error, data) {
        if (error) {
            console.error(error)
        } else {
            if (data == null) {
                res.redirect(fallbackRedirect)
            } else {
                functions.searchQuery(res, items, 'ProductKey', item, 'items.ejs', fallbackRedirect);
            }
        }
    })
    // Call searchQuery Function

})

router.get('/cart', function(req, res) {
    functions.getPageLinks(function(links) {
        if (req.session.cart === undefined) {
            res.render('basket.ejs')
        } else {
            if (req.session.cart.length < 1) {
                res.render('basket.ejs')
            } else {
                functions.getBasket(req.session.cart, items, function(result) {
                    functions.updateStock(result, items, true, function(stockResult) {
                        var total = functions.getTotal(result)
                        res.render('basket.ejs', {
                            items: stockResult,
                            total: total
                        })
                    })
                }) 
            }
            
        }
    })
})



//error handler using sessions
router.get('/error', function(req, res) {
    functions.getPageLinks(function(links) {
        functions.errorHandler(res, req.session.errorMsg, links)
        req.session.errorMsg = ""
    })
})





//Terms and policies page renders
router.get('/terms', function(req, res) {
    res.render('terms')
})

router.get('/payment-policy', function(req, res) {
    res.render('payment-policies')
})

// Export back to app.js
module.exports = router;