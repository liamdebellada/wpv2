// Index Modules
const express= require('express');
const router = express.Router();
const expressQueue = require('express-queue');
var paypal = require('paypal-rest-sdk');
var sanitizer = require('sanitize')(); 
const rateLimit = require('express-rate-limit');

const https = require('https')

//exports
const paymentDataConst = require('../exports/payment-data');
var functions = require('../exports/functions')
var emailSend = require('../exports/email')
var mongoose = require('mongoose'); 

//mongo models
const items = require('../models/items');
const accounts = require('../models/accounts')
const logs = require('../Management/models/logs')
const { all } = require('./cart');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

//paypal config (located in .env)
paypal.configure({
    'mode': process.env.MODE, 
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});

const Discord = require('discord.js');
const client = new Discord.Client();
client.login('NzQwOTU4MzMxMzc5Nzc3NjU4.XywlOA.dQAzqV4rGRLOQgwQ5ovqBZrSLd4');

//rate limiter

const limitRequests = rateLimit({
    windowMS: 1000,
    max: 100,
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


router.post('/executePayment', limitRequests, recaptcha.middleware.verify,  function (req, res) {

    try {
        if (!req.recaptcha.error && req.session.cart.length > 0) {
            var check = functions.checkStock(req.session.cart, accounts, function(result, conflicts) {
                if (result.includes(true)) {
                    //error
                    for (i in conflicts) {
                        req.session.cart.splice(conflicts[i], 1)
                    }
                    req.session.errorMsg = "Your quantity is greater than the current stock for that item."
                    res.redirect('/error')
                    //call function to draw error messages to the page
                } else {
                    var paymentData = paymentDataConst
        
                    functions.getBasket(req.session.cart, items, function(result) {
                        req.session.order = result //use this to pass to email template
                        req.session.viewOrder = result
                        paymentData.transactions[0].item_list.items = []
                        var total = functions.getTotal(result, "true")
                        for (item in result) {
                
                            var itemData = result[item][0] //Indivudal Item Data
                            var quantity = result[item][1] //Indivudal Item Quantity
                
                            var itemObject =  {
                                "name" : itemData.Title,
                                "sku" : "1",
                                "price" : itemData.Price,
                                "currency" : "GBP",
                                "quantity" : quantity
                            }
                
                            paymentData.transactions[0].item_list.items.push(itemObject)
                        }
                        var fee = {
                            "name" : "Fee",
                            "sku" : "1",
                            "price" : functions.calculateFee(result),
                            "currency" : "GBP",
                            "quantity" : "1"
                        }
                        paymentData.transactions[0].item_list.items.push(fee)
                        paymentData.transactions[0].amount.total = total.toString()
                        // console.log(paymentData.transactions[0].item_list)
                        // console.log(paymentData.transactions[0].amount)
                
                        paypal.payment.create(paymentData, function (error, payment) {
                            if (error) {
                                res.redirect('/error')
                            } else {
                                req.session.total = total.toString()
                                req.session.fee = functions.calculateFee(result).toString()
                                res.redirect(payment.links[1].href);
                                
                            }
                        });
                        
                        
                    })
                }
            })
        } else {
            if (req.session.cart.length > 0) {
                req.session.errorMsg = 'Please add an item to your cart before purchasing.'
                res.redirect('/error')
            } else {
                req.session.errorMsg = 'Please complete the captcha before purchasing.'
                res.redirect('/error')
            }
            
        }
    } catch {
        req.session.errorMsg = 'There was an error while checking out'
        res.redirect('/error')
    }
    
})

router.get('/checkout', limitRequests, function (req, res, next) {
    try{
        var total = req.session.total
        if (total == undefined || total == "empty") {
            res.redirect('/cart')
        }
    } catch {
        res.redirect('/cart')
    }
    
    try {
        const paymentId = functions.santizeString(req.query.paymentId)
        const payerId = functions.santizeString(req.query.PayerID)
        if (!req.session.paymentId && !req.session.paymentId) {
            if (paymentId === undefined || payerId === undefined) {
                res.redirect('/cart')
            } else if (paymentId == "" || payerId == "") {
                res.redirect('/cart')
            } else {
                req.session.paymentId = paymentId;
                req.session.payerId = payerId;
            }
        }
        if (req.session.paymentId == paymentId && req.session.payerId == payerId) {
            res.render('confirmation.ejs', {
                items: req.session.viewOrder,
                total: req.session.total,
                fee: req.session.fee
            })
        } else {
            res.redirect('/cart')
        } 
    } catch {
        res.redirect('/cart')
    }
        

})

var sem = require('semaphore')(1);
router.post('/confirmPayment', limitRequests, expressQueue({ activeLimit: 1, queuedLimit: -1}), async function (req, res, next) {

    sem.take(async function() {
        var stockResult = []

        try {
            var paymentId = functions.santizeString(req.session.paymentId)
            var payerId = functions.santizeString(req.session.payerId)
            var total = req.session.total
            if (req.session.paymentId != paymentId && req.session.payerId != payerId) { 
                res.redirect('/cart')
            }
            req.session.paymentId = ""
            req.session.payerId = ""
            req.session.save()


            if (total == undefined || total == "empty") {
                sem.leave();
                return res.send('/cart').status(418).end()
            }
        } catch {
            sem.leave();
            return res.send('/cart').status(418).end()
        }
    
    
    
    
    
        for (item in req.session.order) {
            var id = req.session.order[item][0]._id
            var previousQuantity = req.session.order[item][1]
            await accounts.countDocuments({itemID: id, availability: "true"}, function(error, result) {
                if (error) {
                    sem.leave();
                    console.log("Error checking stock on payement execute", error)
                } else {
                    if (previousQuantity > result) {
                        stockResult.push(true)
                    }
                }
            })
        }
    
        
    
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency":"GBP",
                    "total" : total
                }
            }]
        }
        if (stockResult.includes(true)) {
            sem.leave();
            req.session.errorMsg = "One or more of your items has already been purchased during the checkout process."
            try {
                res.send('/error').end()
            } catch {
                res.send('/error').end()
            }
        } else {


            paypal.payment.execute(paymentId, execute_payment_json, async function(error, payment){

    
                if(error){
                    sem.leave();
                    res.send('/').status(400).end();
                } else {
    
                    if (payment.state == 'approved'){
    
    
    
                        var ids = []
                        var orderLog = []
 
                        new Promise(async function(resolve, reject) {
                            for(let item in req.session.order) {
                                req.session.order[item].push([])
                                let itemData = req.session.order[item][0] 
                                let quantity = req.session.order[item][1]
                                await accounts.find({ itemID: itemData._id, availability : "true" }, function(error, data) {
                                    if (error) {
                                        console.error(error)
                                        reject()
                                    }
                                    if (data.length < 1) {
                                        stockResult = true
                                    } else {
                                        for (i in data) {
                                            if (i < quantity) {
                                                ids.push(data[i]._id)
                                                orderLog.push({"Title" : itemData.Title, "AccountID": data[i]._id})
                
                                                var email = functions.decrypt(data[i].email)
                                                var password = functions.decrypt(data[i].password)
                
                                                req.session.order[item][2].push({email : email, password: password})
                                                req.session.save()
                
                                                
                                            }
                                        }
                                    }
            
                                })
                            }
                            resolve()
                        }).then(async () => {
                            if (ids.length == 0) {
                                console.log("\n\n No IDs were found")
                                console.log(req.session.order)
                            }
                            for (id in ids) {
                                await accounts.updateOne(
                                    {_id : ids[id]},
                                    {availability : "false"},
                                    function(error, success) {
                                        if (error) {
                                            console.log(error)
                                        }
                                })
                            }
                            purchaseID = JSON.stringify(payment.id).replace("PAYID-", "")
    
                            emailSend.sendMail(payment.payer.payer_info.email, req.session.order, req.session.total, purchaseID, function (status) {
                                if (status) {

                    
                                    userInfo = [payment.payer.payer_info.email, purchaseID]
                                        successUrl = async () => {return await functions.createSuccessView({email: payment.payer.payer_info.email, purchaseID: purchaseID, cart: req.session.viewOrder}).then(result => result).catch(err => err)} 
                    
                                    logs.create({Date: payment.create_time, OrderID: purchaseID, Email: payment.payer.payer_info.email, Amount: payment.transactions[0].amount.total, Accounts: orderLog}, async function(error, result) {
                                        if (error) {
                                            console.log(error)
                                        } else {
                                            successUrl = await successUrl()
                                            req.session.destroy(() => {
                                                res.send('/success/' + successUrl)
                                                sem.leave()
                                            })
                                        }
                                    })
    
                                }
                            })
                        }).catch(() => {
                            sem.leave();
                            res.send('/').status(400).end();
                        })


                        
        
        
                        
                    } else {
                        sem.leave();
                        res.send('/').status(400).end();
                    }
                }
            });
        }
    })   
})


module.exports = router;