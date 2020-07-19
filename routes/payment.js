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
const { all } = require('./cart');

//paypal config (located in .env)
paypal.configure({
    'mode': process.env.MODE, 
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});


router.post('/executePayment', function (req, res) {
    var check = functions.checkStock(req.session.cart, accounts, function(result, conflicts) {
        if (result.includes(true)) {
            //error
            for (i in conflicts) {
                req.session.cart.splice(conflicts[i], 1)
            }
            res.send('/error').end()
            //call function to draw error messages to the page
        } else {
            var paymentData = paymentDataConst

            functions.getBasket(req.session.cart, items, function(result) {
                req.session.order = result //use this to pass to email template
                paymentData.transactions[0].item_list.items = []
                var total = functions.getTotal(result)
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
                paymentData.transactions[0].amount.total = total.toString()
        
        
                paypal.payment.create(paymentData, function (error, payment) {
                    if (error) {
                        console.log(error);
                    } else {
                        req.session.total = total.toString()
                        res.send(payment.links[1].href);
                    }
                });
                
                
            })
        }
    })
    
})

router.get('/checkout', function (req, res, next) {

    var total = req.session.total

    if (total == undefined || total == "empty") {
        res.redirect('/cart').end()
    }


    var paymentId = req.query.paymentId;
    var payerId = req.query.PayerID;
    
    if (paymentId === undefined || payerId === undefined) {
        res.send("error")
    }
    else if (paymentId == "" || payerId == "") {
        res.send("error")
    } else {
        res.render('confirmation.ejs', {
            items: req.session.order,
            paymentId: paymentId,
            payerId: payerId
        })
    }
})



router.post('/confirmPayment', async function (req, res, next) {

    try {
        var paymentId = req.body.paymentId
        var payerId = req.body.payerId
        var total = req.session.total

        // if (total == undefined || total == "empty") {
        //     res.send('/cart').status(418).end()
        // }
    } catch {
        // res.send('/cart').status(418).end()
        console.log("error")
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

    


    paypal.payment.execute(paymentId, execute_payment_json, async function(error, payment){
        if(error){
            console.error(JSON.stringify(error));
        } else {
            if (payment.state == 'approved'){
                res.send('/').status(202).end()
                var ids = []
                for(let item in req.session.order) {
                    req.session.order[item].push([])
                    let itemData = req.session.order[item][0]
                    let quantity = req.session.order[item][1]
                    await accounts.find({ itemID: itemData._id, availability : "true" }, function(error, data) {
                        for (i in data) {
                            if (i < quantity) {
                                ids.push(data[i]._id)


                                var email = functions.decrypt(data[i].email)
                                var password = functions.decrypt(data[i].password)
                                //console.log(email, password)

                                req.session.order[item][2].push({email : email, password: password})
                                console.log(req.session.order)
                                req.session.save()

                                
                            }
                        }

                    })
                    
                }
                console.log("calling email function")
                for (id in ids) {
                    accounts.updateOne(
                        {_id : ids[id]},
                        {availability : "false"},
                        function(error, success) {
                            if (error) {
                                console.log(error)
                            } else {
                                console.log("calling")
                                
                            }
                    })
                }
                emailSend.sendMail(payment.payer.payer_info.email, req.session.order, req.session.total)
                req.session.total = "empty"
            } else {
                res.send('/').status(400).end();
            }
        }
    });
})


module.exports = router;