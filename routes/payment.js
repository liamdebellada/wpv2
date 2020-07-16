// Index Modules
const express= require('express');
const router = express.Router();
var paypal = require('paypal-rest-sdk');
const paymentDataConst = require('../exports/payment-data');
var functions = require('../exports/functions')

const items = require('../models/items');

paypal.configure({
    'mode': process.env.MODE, 
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});

router.post('/executePayment', function (req, res) {
    var paymentData = paymentDataConst
    functions.getBasket(req.session.cart, items, function(result) {
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
        functions.getBasket(req.session.cart, items, function(result) {
            res.render('confirmation.ejs', {
                items: result,
                paymentId: paymentId,
                payerId: payerId
            })
        })
    }
})

router.post('/confirmPayment', function (req, res, next) {


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
    

    
    

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency":"GBP",
                "total" : total
            }
        }]
    }


    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
        if(error){
            console.error(JSON.stringify(error));
        } else {
            if (payment.state == 'approved'){
                req.session.total = "empty"
                res.send('/').status(202).end()
            } else {
                res.send('/').status(400).end();
            }
        }
    });
})


module.exports = router;