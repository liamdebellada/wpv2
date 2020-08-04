// This route will handle the cart.

// Cart Modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Export Models
const items = require('../models/items');
const functions = require('../exports/functions');
const session = require('../models/sessionTable');
const products = require('../models/products');

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
                if (result != undefined || result != null) {

                    products.findOne({
                        ProductKey: result.ProductKey
                    }, function (error, resulttt) {
                        if (error) {
                            console.log(error)
                        } else {
                            if (resulttt.productState == "enabled") {
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
                                    console.log(req.session.cart)
                                    var getBasket = functions.getBasket(req.session.cart, items, function (result) {
                                        res.send(result)
                                    })
                                }
                            } else {
                                res.send("This item does not exist.").end()
                            }
                        }
                    })




                } else {
                    res.send("There was an error adding the item to the basket. Please try again").end()
                }


            })
        } else {
            // Socket Error
            console.log(result)
            res.send("Item already in basket").end()
        }
    })

})

router.post('/removeCart', function (req, res) {
    var deletionId = req.body.id
    var userCart = req.session.cart
    var index = userCart.findIndex(x => x.id === deletionId)
    userCart.splice(index, 1)
    req.session.cart = userCart
    req.session.save()
    if (req.session.cart === undefined) {
        res.send("e")
    } else {
        if (req.session.cart.length < 1) {
            res.send("e")
        }
        functions.getBasket(req.session.cart, items, function (result) { //when basket is empty it loads endlessly???
            res.send(result)
        })
    }
})

router.post('/updateQuantity', function (req, res) {
    var index = req.session.cart.findIndex(x => x.id === req.body.id)
    var obj = {
        id: req.body.id,
        quantity: req.body.quantity
    }
    req.session.cart[index] = obj

    req.session.save()
    functions.getBasket(req.session.cart, items, function (result) {
        res.send(result)
    })
})

router.post('/getCart', (req, res) => {
    if (req.session.cart === undefined) {
        res.send("e")
    } else {
        if (req.session.cart.length < 1) {
            res.send("e")
        }
        functions.getBasket(req.session.cart, items, function (result) {
            res.send(result)
        })
    }
})


// Export back to app.js

module.exports = router;