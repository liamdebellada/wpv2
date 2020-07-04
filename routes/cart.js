// This route will handle the cart.

// Cart Modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Export Models
const items = require('../models/items');
const functions = require('../exports/functions');
const session = require('../models/sessionTable')

router.post('/updateCart', (req, res) => {
    var cartItemId = req.body.items
    var quantity = req.body.quantity

    var checkId = functions.checkID(req.session, cartItemId) // Check if item exists in cart already

    if (req.session.cart == undefined) {
        req.session.cart = []
    }

    checkId.then(function (result) {
        if (!result) { //if the value doesnt exist yet
            var check = functions.checkItem(cartItemId, items)
            check.then(function (result) {
                var calculatePrice = functions.getPrice(result, quantity)
                if (calculatePrice !== undefined) { //checks if the price is above 1
                    result.Price = calculatePrice

                    var item = {
                        "id": result._id,
                        "quantity": quantity
                    }

                    if (req.session.cart.length > 0) {
                        req.session.cart.push(item)
                    } else {
                        req.session.cart = [item]
                    }
                    var getBasket = functions.getBasket(req.session.cart, items, function(result) {
                        console.log(result)
                        res.send(result)
                    }) 



                    //res.send(req.session.cart)
                }

            })
        } else {
            // Socket Error
            res.send("Item already in basket")
        }
    })

})

router.post('/getCart', (req, res) => {
    //res.send(req.session.cart)
    var getBasket = functions.getBasket(req.session.cart, items, function(result) {
        console.log(result)
        res.send(result)
    }) 
})


// Export back to app.js

module.exports = router;