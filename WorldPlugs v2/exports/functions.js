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

    }

 


}

module.exports = functions