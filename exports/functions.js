const e = require("express")
const session = require("express-session")

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
                if (result.length > 0) {
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
    }


}

module.exports = functions