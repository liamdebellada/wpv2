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
const banners = require('../Management/models/banners');
const guides = require('../models/guides');
const terms = require('../models/terms')
const successOrders = require('../models/successOrders.js')

const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)


const bcrypt = require('bcrypt')

// Export Functions
const functions = require('../exports/functions');

var crypto = require("crypto")

//rate limiter
const rateLimit = require('express-rate-limit');

const limitRequests = rateLimit({
    windowMS: 1000,
    max: 500,
    message:
    "You are sending too many requests to the server.",
    onLimitReached: function(req) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        https.get(`https://api.ipgeolocation.io/ipgeo?apiKey=cefdbd6742ab46a09c460ddd81ee0e9e&ip=${ip}&fields=geo&include=security`, function(resp) {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            resp.on('end', async () => {
                var datares = "\n```json\n" + JSON.stringify(JSON.parse(data),null,2) + "```"
                await client.channels.cache.get('741352723693174905').send("", {files: ['https://thumbs.gfycat.com/CostlyDopeyAcornwoodpecker-size_restricted.gif']})
                client.channels.cache.get('741352723693174905').send(datares);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
})


router.post('/secureShutdown', function(req, res) {
    var pass = req.body.key
    bcrypt.compare(pass, process.env.SPASS, function(err, result) {
        if(err) {
            console.error(err)
        } else{
            if (result) {
                process.on('exit', function() {
                    res.send('s')
                })
                process.exit()
            } else {
                res.send('e')
            }
        }
    });
})

// Pages


router.get('/getStatus/key=:key', function(req, res) {
	req.params.key.toString() == 'tracked48' ? res.json({'status' : 'connected'}) : res.status(404)
})

router.get('/', (req, res) => {
    // Call searchQuery Function
    req.session.errorMsg = ""
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    functions.searchQuery(res, category, '', '', 'homepage.ejs', ip);

})

router.get('/products', (req, res) => {
    req.session.errorMsg = ""
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    functions.searchQuery(res, category, '', '', 'allproducts.ejs', ip);
})

router.get('/products/:product', function (req, res) {

    // Incl data sanitization here
    var product = req.params.product.toString();

    // Call searchQuery Function
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    functions.searchQuery(res, products, 'CategoryKey', product, 'products.ejs', '/products');


})


router.post('/searchData', limitRequests, function(req, res) {
    var query = sanitize(req.body.searchQuery)
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (query == "") {
        res.send("Cant find what your looking for? Request an item in our discord!")
    } else {
        products.fuzzySearch(query, function(err, results) {
            if (err) {
                functions.createErrorLog("Search error, fuzzy search returned **err**", ip)
                console.error(err);
            } else {
                if (results.length < 1) {
                    res.send("WorldPlugs couldnt find what you are looking for :(")
                } else {
                    var filtered = results.filter(function(filteredResult) {
                        return filteredResult.productState == "enabled"
                    })
                    res.send(filtered)
                }
            }
        });
    }

})


router.get('/success/:successURL', function(req, res) {

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    try {
        successOrders.findOne({url: req.params.successURL.toString()}, function(error, result) {
            if (error) {
                functions.createErrorLog("Error whilst accessing success URL", ip)
            } else {
                if (result) {
                    res.render('success.ejs', {email: result.purchaseData.email, purchaseID: result.purchaseData.purchaseID, cart: result.purchaseData.cart})
                } else {
                    functions.createErrorLog("User tried to reach /success without a valid order.", ip)
                    res.redirect('/')
                }
            }
        })
    } catch {
        console.log("User tried to reach /success without a valid order.", ip)
        functions.createErrorLog("User tried to reach /success without a valid order.", ip)
        res.redirect('/')
    }
    
})


router.get('/products/:product/items/:items', async function (req, res) {
    var item = req.params.items.toString().toLowerCase();
    var category = req.params.product.toString().toLowerCase();
    var fallbackRedirect = '/products/' + req.params.product.toString().toLowerCase();
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await products.findOne({CategoryKey: category, ProductKey: item}, function(error, data) { 
        if (error) {
            console.error(error)
        } else {
            if (data == null) {
                functions.getPageLinks(function(links) {
                    functions.errorHandler(res, "This items page doesn't exist or is no longer available!", links)
                })
            } else {
                functions.searchQuery(res, items, 'ProductKey', item, 'items.ejs', fallbackRedirect);
            }
        }
    })
})

router.get('/cart', function(req, res) {
    if (req.session.cart === undefined) {
        res.render('cart.ejs')
    } else {
        if (req.session.cart.length < 1) {
            res.render('cart.ejs')
        } else {
            functions.getBasket(req.session.cart, items, function(result) {
                functions.updateStock(result, items, true, function(stockResult) {
                    var total = functions.getTotal(result)
                    var fee = functions.calculateFee(result)
                    res.render('cart.ejs', {
                        items: stockResult,
                        total: total,
                        fee: fee
                    })
                })
            }) 
        }
        
    }
})

router.get('/support', function(req, res) {
    functions.searchQuery(res, guides, '', '', 'guidesIndex.ejs', '/')
})

router.get('/support/:guide', function(req, res) {
    try {
        guides.findOne({GuideLink : req.params.guide.toString()}, function(error, result) {
            try {
                if (error || result.length < 1) {
                    functions.getPageLinks(function(links) {
                        res.render('404', { links: links });
                        return;
                    })
                } else {
                    res.render('guide.ejs', {guide: result})
                }
            } catch {
                functions.getPageLinks(function(links) {
                    res.render('404', { links: links });
                    return;
                })
            }
        })
    } catch {
        functions.getPageLinks(function(links) {
            res.render('404', { links: links });
            return;
        })
    }
    
})


//error handler using sessions
router.get('/error', function(req, res) {
    functions.getPageLinks(function(links) {
        functions.errorHandler(res, req.session.errorMsg, links)
        req.session.errorMsg = ""
    })
})

//Terms and policies page renders
router.get('/terms', async function(req, res) {
    var termsData = await terms.findOne({contentKey : "terms-and-conditions"}).then(result => result).catch(error => error)
    functions.getPageLinks(function(Links) { 
        res.render('terms', {links: Links, termsData: termsData}) 
    })
})

router.get('/payment-policy', async function(req, res) {
    var termsData = await terms.findOne({contentKey : "payment-policy"}).then(result => result).catch(error => error)
    functions.getPageLinks(function(Links) {
        res.render('payment-policies', {links: Links, termsData: termsData})
    })
})

// Export back to app.js
module.exports = router;
