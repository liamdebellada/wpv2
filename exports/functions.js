const e = require("express")
const session = require("express-session")
var crypto = require('crypto');
const accounts = require('../models/accounts');
var functions = {

    // Search Database With Arguments

    searchQuery: function (res, modelName, dbKey, userQuery, pageRender, fallbackRedirect = '/', fallbackError = "There was an issue display the page. You have been redirected.") {

        query = {}
        if (dbKey !== '') {
            query[dbKey] = userQuery
        }
        modelName.find(
                query
            ).then(result => {
                if (pageRender == "items.ejs") {
                    this.updateStock(result, modelName, function(stockResult) {
                        if (result.length > 0) {
                            res.render(pageRender, {
                                results: stockResult
                        })}
                    })
                }
                else if (result.length > 0) {
                    res.render(pageRender, {
                        results: result
                    })
                } else {
                    // Liam include socket.io response here
                    res.redirect(fallbackRedirect)
                }
            })
            .catch(categories => {
                // Liam include socket.io response here
                res.redirect(fallbackRedirect)
            })

    },

    //check if the session cart item id is equal to the request id

    checkID: async function someFunc(session, cartItemId) {
        try {
            if (session.cart.some(e => e.id === cartItemId)) {
                return true
            } else if (session.cart.id === undefined) {
                return false
            }
        } catch {
            return false
        }

    },

    //checks if the request item exists in the items table

    checkItem: function (cartItem, items) {
        return items.findOne({
            _id: cartItem
        }).then(result => {
            return result
        }).catch(errorCatch => {
            res.redirect("/")
        })
    },

    //calculates the total based on quantity

    getPrice: function (result, quantity) {
        if (quantity > 0) {
            var price = parseInt(result.Price)
            return (price * quantity).toString()
        } else {
            //error here
            const errMsg = "Invalid order"
        }
    },

    //Uses existing session basket returning usable data to the client

    getBasket: function (sessionBasket, items, callback) {

        var arr = []
        for (item in sessionBasket) {
            let obj = sessionBasket[item]
            items.find(
                { _id: obj.id },
                function(err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        result.push(obj.quantity)
                        arr.push(result)
                        if (arr.length == sessionBasket.length) {
                            return callback(arr) //callback function is inside the function caller
                        }
                    }
                }
            );

        }
    },

    errorHandler: function(res, message) {
        res.render("error.ejs", {msg : message})
    },

    getTotal : function(result) {
        var total = 0;
        result.forEach(function(row) {
            var item = row[0]
            var quantity = row[1]
            total = total + parseFloat(item.Price) * parseInt(quantity)
        })
        return total.toFixed(2);
    },

    updateStock : function(results, items, callback) {
        var temp = []
        for (let item in results) {
            var id = results[item]._id
            accounts.countDocuments( {itemID : id, availability : "true" },
            function(error, stock) {
                if (error) {
                    console.log(error)
                } else {
                    var obj = results[item].toObject()
                    obj.Stock = stock
                    temp.push(obj)
                    if (parseInt(item) + 1 == results.length) {
                        return callback(temp)
                    }
                }
            })
        }
    
    },

    checkStock: function(session, accounts, callback) {
        var result = []
        var conflicts = []
        for (let item in session) {
            var id = session[item].id
            let quantity = session[item].quantity
            accounts.countDocuments( {itemID : id, availability : "true" },
            function(error, stock) {
                if (error) {
                    console.log(error) 
                } else {
                    if (quantity > stock) {
                        result.push(true)
                        conflicts.push(parseInt(item))
                    } else {
                        result.push(false)
                    }
                    if (parseInt(item) + 1 == session.length) {
                        return callback(result, conflicts)
                    }
                }
            })
        }
    },

    decrypt: function(data) {
        var mykey = crypto.createDecipher('aes-128-cbc', process.env.KEY);
        var mystr = mykey.update(data, 'hex', 'utf8')
        mystr += mykey.final('utf8');
        return mystr;
    }

}

module.exports = functions