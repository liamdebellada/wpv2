const e = require("express")
const session = require("express-session")
var crypto = require('crypto');
const accounts = require('../models/accounts');
const banners = require('../Management/models/banners')
const links = require('../Management/models/links');
const products = require("../models/products");
const errorlog = require('../Management/models/errorLogs.js')
var functions = {

    // Search Database With Arguments

    searchQuery: async function (res, modelName, dbKey, userQuery, pageRender, fallbackRedirect = '/', fallbackError = "There was an issue display the page. You have been redirected.") {
        var pageLinks;
        await links.find({}, function(error, result) {
            if (error) {
                res.redirect(fallbackRedirect)
            } else {
                pageLinks = result
            }
        })

        query = {}
        if (dbKey !== '') {
            query[dbKey] = userQuery
        }
        modelName.find(
                query
            ).then(result => {
                if (pageRender == "items.ejs") {
                    try {
                        products.findOne({ProductKey: userQuery}, function (error, product) {
                            if (error) {
                                console.log(error)
                            } else {
                                try {
                                    if (product.productState == "enabled") {
                                        functions.updateStock(result, modelName, false, function(stockResult) {
                                            if (result.length > 0) {
                                                functions.getBanners(function(banner) {
                                                    res.render(pageRender, {
                                                        results: stockResult,
                                                        banner: banner,
                                                        links: pageLinks
                                                })
                                            })}
                                        })
                                    } else {
                                        res.redirect(fallbackRedirect)
                                    }
                                } catch {
                                    res.redirect(fallbackRedirect)
                                }
                            }
                        })   
                    } catch {
                        res.redirect(fallbackRedirect)
                    }    
                }
                else if (result.length > 0) {
                    this.getBanners(function(banner) {
                        res.render(pageRender, {
                            results: result,
                            banner: banner,
                            links: pageLinks
                        })
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
            console.log("error")
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

    errorHandler: function(res, message, Links) {
        res.render("partials/error.ejs", {msg : message, links: Links})
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

    countStock : async function(id, name, callback) {
        await accounts.countDocuments( {itemID : id, availability : "true" },
        function(error, stock) {
            if (error) {
                console.log(error)
            } else {
                return callback(stock)
            }
        })
    },


    updateStock : async function(results, items, cartCheck, callback) {
        if (cartCheck) {
            var temp = []
            for (let item in results) {
                let id = results[item][0]._id
                let quantity = results[item][1]
                this.countStock(id, results[item].Title, function(stock) {
                    var obj = results[item][0].toObject()
                    obj.Stock = stock
                    obj.Quantity = quantity
                    temp.push(obj)
                    if (parseInt(item) + 1 == results.length) {
                        return callback(temp)
                    }
                })
            }
        } else {
            var temp = []
            for (let item in results) {
                let id = results[item]._id
                this.countStock(id, results[item].Title, function(stock) {
                    var obj = results[item].toObject()
                    obj.Stock = stock
                    temp.push(obj)
                    if (parseInt(item) + 1 == results.length) {
                        return callback(temp)
                    }
                })
            }
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
    },

    getBanners: function(callback) {
        banners.findOne({active: true}, function(error, banner) {
            if (error) {
                console.log(error)
            } else {
                return callback(banner)
            }
        })
    },
    
    getPageLinks: async function(callback) { //WorldPlugs 2020 proprietary link management
        var obj = {}
        var linkArr;
        await links.find({}, function(error, links) {
            if (error) {
                console.log(error)
            } else {
                linkArr = links
            }
        })
        linkArr.forEach(function(link) {
            var key = link.key
            obj[key] = link.link
        })
        return callback(obj)
    },

    createErrorLog: function(message, address) {
        var dt = new Date();
        var errorObject = {
            Date: dt,
            Message: message,
            Address: address
        }
        console.log(errorObject)
        errorlog.create(errorObject, function(error, result) {
            if (error) {
                console.error(error)
            } else {
                console.log(result)
            }
        }) 
    }

}

module.exports = functions