const e = require("express")

var functions = {

    // Search Database With Arguments

    searchQuery  : function(res, modelName, dbKey, userQuery, pageRender, fallbackRedirect='/', fallbackError="There was an issue display the page. You have been redirected.",) {

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

    checkID: async function someFunc(session, cartItemId) {
        try {
            if (session.cart.id == cartItemId) {
                console.log("exists")
                return true
            } else if (session.cart.id === undefined) {
                console.log("doesnt exist")
                return false
            }
        } catch {
            return false
        }

    },

    checkItem : function(cartItem, items) {
        return items.findOne({
            _id: cartItem
        }).then(result => {
            return result
        }).catch(errorCatch => {
            res.redirect("/")
        })
    },

    getPrice : function(result, quantity) {
        if (quantity > 1) {
            var price = parseInt(result.Price)
            return(price * quantity).toString()
        } else {
            //error here
            const errMsg = "Invalid order"
        }
    }


}

module.exports = functions