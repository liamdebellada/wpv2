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



    checkId.then(function (result) {
        if (!result) {
            var check = functions.checkItem(cartItemId, items)
            check.then(function (result) {
                var calculatePrice = functions.getPrice(result, quantity)
                if (calculatePrice !== undefined) {
                    result.Price = calculatePrice
                    var item = {
                        "id": result._id,
                        "quantity": quantity
                    }

                    req.session.cart = item
                    res.send(result)
                }

            })
        } else {
            // Socket Error
            res.send("error").status(200)
        }
    })



})



// Export back to app.js

module.exports = router;