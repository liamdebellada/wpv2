// Index Modules
const express= require('express');
const router = express.Router();
var paypal = require('paypal-rest-sdk');

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


router.post('/executePayment', recaptcha.middleware.verify,  function (req, res) {

    if (!req.recaptcha.error) {
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
            
                    paypal.payment.create(paymentData, function (error, payment) {
                        if (error) {
                            console.log(error.response.details);
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
        res.redirect('/error')
    }
    
})

router.get('/checkout', function (req, res, next) {

    try{
        var total = req.session.total
        if (total == undefined || total == "empty") {
            res.redirect('/cart')
        }
    } catch {
        res.redirect('/cart')
    }
    

    try {
        var paymentId = req.query.paymentId;
        var payerId = req.query.PayerID;
        if (paymentId === undefined || payerId === undefined) {
            res.redirect('/cart')
        }
        else if (paymentId == "" || payerId == "") {
            res.redirect('/cart')
        } else {
            res.render('confirmation.ejs', {
                items: req.session.viewOrder,
                paymentId: paymentId,
                payerId: payerId,
                total: req.session.total,
                fee: req.session.fee
            })
        }
    } catch {
        res.redirect('/cart')
    }

})


let paymentProcessing = false
router.post('/confirmPayment', function (req, res, next) {
    async function payment () {
        var stockResult = []
        paymentProcessing = true

        try {
            var paymentId = req.body.paymentId
            var payerId = req.body.payerId
            var total = req.session.total
    
            if (total == undefined || total == "empty") {
                res.send('/cart').status(418).end()
            }
        } catch {
            res.send('/cart').status(418).end()
        }
    
    
    
    
    
        for (item in req.session.order) {
            var id = req.session.order[item][0]._id
            var previousQuantity = req.session.order[item][1]
            await accounts.countDocuments({itemID: id, availability: "true"}, function(error, result) {
                if (error) {
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

            req.session.errorMsg = "One or more of your items has already been purchased during the checkout process."
            try {
                res.send('/error').end()
            } catch {
                res.end()
            }
        } else {


            paypal.payment.execute(paymentId, execute_payment_json, async function(error, payment){
                

    
                if(error){
                    res.send('/').status(400).end();
                } else {
    
                    if (payment.state == 'approved'){
    
    
    
                        var ids = []
                        var orderLog = []
                        for(let item in req.session.order) {
                            req.session.order[item].push([])
                            let itemData = req.session.order[item][0] 
                            let quantity = req.session.order[item][1]
        
                            await accounts.find({ itemID: itemData._id, availability : "true" }, function(error, data) {
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
                        for (id in ids) {
                            accounts.updateOne(
                                {_id : ids[id]},
                                {availability : "false"},
                                function(error, success) {
                                    if (error) {
                                        console.log(error)
                                    } else {}
                            })
                        }
                        purchaseID = JSON.stringify(payment.id).replace("PAYID-", "")
        
                        emailSend.sendMail(payment.payer.payer_info.email, req.session.order, req.session.total, purchaseID)
        
        
                        req.session.total = "empty"
                        req.session.cart = []
        
                        req.session.userInfo = [payment.payer.payer_info.email, purchaseID]
        
                        req.session.save()
        
                        logs.create({Date: payment.create_time, OrderID: purchaseID, Email: payment.payer.payer_info.email, Amount: payment.transactions[0].amount.total, Accounts: orderLog}, function(error, result) {
                            if (error) {
                                console.log(error)
                            }
                        })
                        paymentProcessing = false
                        clearInterval(waiting)
                        res.send('/success').status(200).end()
                    } else {
                        res.send('/').status(400).end();
                    }
                }
            });
        }
        
    
    }

    if (!paymentProcessing) {
        paymentProcessing = true
        payment()
    } else {
        //var executionCounter = 0
        console.log("entering wait stage.")
        var waiting = setInterval(function() {
            // executionCounter += 1
            // if (executionCounter > 1) {
            //     clearInterval(waiting)
            // }

            if (!paymentProcessing) {
                payment()
            }
            
        }, 2000)

    }
})


module.exports = router;