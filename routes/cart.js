// This route will handle the cart.

// Cart Modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');



// Export Models
const items = require('../models/items');
const functions = require('../exports/functions');
const session = require('../models/sessionTable');
const products = require('../models/products');

const https = require('https')


//discord logging stuff
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



router.post('/updateCart', limitRequests, (req, res) => {
    try {
        var cartItemId = req.body.items
        var quantity = req.body.quantity 
        if (quantity > 0 && parseInt(quantity)) {
            var checkId = functions.checkID(req.session, cartItemId) // Check if item exists in cart already
            if (req.session.cart == undefined) {
                req.session.cart = []
            }
            checkId.then(function (result) {
                if (!result) { //if the value doesnt exist yet

                    var check = functions.checkItem(cartItemId, items)
                    check.then(function (item) {
                        if (item != undefined || item != null) {
                            products.findOne({
                                ProductKey: item.ProductKey
                            }, function (error, product) {
                                if (error) {
                                    console.log(error)
                                } else {
                                    if (product.productState == "enabled") {
                                        var calculatePrice = functions.getPrice(item, quantity)
                                        if (calculatePrice !== undefined) { //checks if the price is above 1
                                            item.Price = calculatePrice

                                            var createItem = {
                                                "id": item._id,
                                                "quantity": quantity
                                            }

                                            if (req.session.cart.length > 0) {
                                                req.session.cart.push(createItem)
                                            } else {
                                                req.session.cart = [createItem]
                                            }
                                            functions.getBasket(req.session.cart, items, function (userCart) {
                                                res.send({
                                                    userCart: userCart,
                                                    Item: item.Title + " has been added to your cart."
                                                }).end()
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
                    functions.getBasket([{
                        id: cartItemId,
                        quantity: "1"
                    }], items, function (errorItem) {
                        res.send(`${errorItem[0][0].Title} is already in your basket`).end()
                    })
                }
            })
        } else {
            res.send('Please input a quantity before adding an item to the basket.')
        }
    } catch {
        res.send('There was an error adding the item to the basket. Please try again').end()
    }


})

router.post('/removeCart', limitRequests, function (req, res) {
    try {
        var deletionId = req.body.id
        var userCart = req.session.cart
        if (req.session.cart && req.session.cart.length > 0) {
            var index = userCart.findIndex(x => x.id === deletionId)
            userCart.splice(index, 1)
            req.session.cart = userCart
            req.session.save()
            if (req.session.cart === undefined) {
                res.send("e")
            } else {
                if (req.session.cart.length < 1) {
                    res.send("e")
                } else {
                    functions.getBasket(req.session.cart, items, function (result) { //when basket is empty it loads endlessly???
                        res.send(result)
                    })
                }
                
            }
        } else {
            res.send("e").end()
        }
    } catch {
        res.send("e").end()
    }
})

router.post('/updateQuantity', limitRequests, function (req, res) {
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