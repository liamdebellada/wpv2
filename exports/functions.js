const e = require("express")
const session = require("express-session")
var crypto = require('crypto');
const accounts = require('../models/accounts');
const banners = require('../Management/models/banners')
const links = require('../Management/models/links');
const products = require("../models/products");
const categories = require("../models/categories.js")
const errorlog = require('../Management/models/errorLogs.js')
const guides = require('../models/guides')


const successOrders = require('../models/successOrders.js')

var ejs = require("ejs")

const Discord = require('discord.js');
const client = new Discord.Client();
client.login('NzQwOTU4MzMxMzc5Nzc3NjU4.XywlOA.dQAzqV4rGRLOQgwQ5ovqBZrSLd4');

var functions = {

    // Search Database With Arguments

    searchQuery: async function (res, modelName, dbKey, userQuery, pageRender, fallbackRedirect = '/', fallbackError = "There was an issue display the page. You have been redirected.", ip) {
        var pageLinks = await links.find({}).then(result => result).catch(error => console.log(error))
        query = {}
        if (dbKey !== '') query[dbKey] = userQuery
        modelName.find(query)
        .then(async result => {
                if (pageRender == "items.ejs") {
                    try {
                        products.findOne({ProductKey: userQuery}, function (error, product) {
                            if (error) {
                                this.createErrorLog(error.toString(), 'no-address')
                            } else {
                                try {
                                    if (product.productState == "enabled") {
                                        functions.updateStock(result, modelName, false, function(stockResult) {
                                            if (result.length > 0) {
                                                functions.getBanners(function(banner) {
                                                    res.render(pageRender, {
                                                        title: product.Title,
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
                    if (pageRender == "products.ejs") {
                        var title = await categories.findOne({CategoryKey: userQuery}).then(title => title).catch(error => console.log(error))
                        functions.getBanners(function(banner) {
                            res.render(pageRender, {
                                title: title.Title,
                                results: result,
                                banner: banner,
                                links: pageLinks
                            })
                        })
                    }
                    else {
                        functions.getBanners(function(banner) {
                            res.render(pageRender, {
                                results: result,
                                banner: banner,
                                links: pageLinks
                            })
                        })
                    }
                    
                } else {
                    res.redirect(fallbackRedirect)
                }
            })
            .catch(err => res.redirect(fallbackRedirect))
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
            console.log(errorCatch)
        })
    },

    //calculates the total based on quantity

    getPrice: function (result, quantity) {
        if (quantity > 0) {
            var price = parseInt(result.Price)
            return (price * quantity).toString()
        } else {
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

    getTotal : function(result, payment = "false") {
        var total = 0;
        result.forEach(function(row) {
            var item = row[0]
            var quantity = row[1]
            total = total + parseFloat(item.Price) * parseInt(quantity)
        })
        if (payment == "true") {

            fee = this.calculateFee(result)


            total = parseFloat(parseFloat(total).toFixed(2))

            total = total + parseFloat(fee)
        }
        
        return total
    },

    calculateFee : function(result) {
        var total = 0;
        var fee = 0;
        result.forEach(function(row) {
            var item = row[0]
            var quantity = row[1]
            total = total + parseFloat(item.Price) * parseInt(quantity)
        })
        total = total / 100 * 2.9
        total += 0.30
        fee = total
        return fee.toFixed(2);
    },

    countStock : async function(id, name, callback) {
        await accounts.countDocuments( {itemID : id, availability : "true", hidden: "false" },
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
                await this.countStock(id, results[item].Title, function(stock) {
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
                await this.countStock(id, results[item].Title, function(stock) {
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
            accounts.countDocuments( {itemID : id, availability : "true", hidden: "false" },
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

    getBanners: async function(callback) {
        var banner = await banners.findOne({active: true}).then(banner => banner).catch(error => console.log(error))
        return callback(banner)
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
        await linkArr.forEach(function(link) {
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
        var prettyObj = JSON.stringify(errorObject,null,2)
        var msg = "@Dev\n```json\n" + prettyObj + "```"
        client.channels.cache.get("741734136728911913").send(msg.toString());
    },

    prettyJSON: (obj) => {return JSON.stringify(obj, null, 2)},

    santizeString: function(string) {
        return string.replace(/[^0-9a-zA-Z-]/g, '')
    },

    createSuccessView: async (data) => {
        var successURL = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
        await successOrders.create(
            {
                url: successURL,
                purchaseData: data
            }
        )
        .then(result => result)
        .catch(err => console.error(err))
        return successURL
    }

}

module.exports = functions