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

    checkItem : function(cartItem, items) {
        return items.findOne({
            _id: cartItem
        }).then(result => {
            return result
        }).catch(errorCatch => {
            res.redirect("/")
        })
    },

    checkId : function(cartitems, session) {
        if (cartitems)
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