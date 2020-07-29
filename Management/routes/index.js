const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
} = require('../config/auth');
const {ECAKey} = require('../config/keys')
const mongoose = require('mongoose');
const crypto = require('crypto');
const assert = require('assert');

var http = require('http');

const banners = require('../models/banners');
const categories = require('../../models/categories')
const products = require('../../models/products')
const items = require('../../models/items')
const accounts = require('../../models/accounts')
const e = require('express');


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


//static routes for rendering pages
router.get('/dashboard', ensureAuthenticated, (req, res) => {

        const uid = req.user.uid


        res.render('dashboard', {
            name: req.user.name,
        })   
    }
)

router.get('/banners', ensureAuthenticated, function(req, res) {
    banners.find({}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            res.render('banners.ejs', {
                data: result
            })
        }
    })
})

router.get('/categories', ensureAuthenticated, async function(req, res) {
    var results = []
    await categories.find({}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            results.push(result)
        }
    })
    res.render('categories.ejs', {
        data: results
    })
})

router.get('/products', ensureAuthenticated, async function(req, res) {
    var results = []
    await categories.find({}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            results.push(result)
        }
    })
    res.render('products.ejs' , {
        data: results
    })
})

router.get('/browseProducts/:categoryKey', ensureAuthenticated, function(req, res) {
    var key = req.params.categoryKey.toString();
    products.find({ CategoryKey : key}, function(error, results) {
        if (error) {
            console.log(error)
        } else {
            res.render('products-view', {products: results})
        }
    })
})

router.get('/browseItems/:productKey', ensureAuthenticated, function(req, res) {
    var key = req.params.productKey.toString()
    items.find({ ProductKey: key }, function(error, results) {
        if (error) {
            console.error(error)
        } else {
            res.render('items-view', {items: results})
        }
    })
})

router.get('/manageAccounts/:id', ensureAuthenticated, function(req, res) {
    var id = req.params.id.toString()
    accounts.find({itemID: id}, function(error, result) {
        if (error) {
            console.error(error)
        } else {
            res.render('accounts-view', {accounts: result})
        }
    })
})


router.get('/admin', ensureAuthenticated, function(req, res) {
    res.render('admin')
})


//category posts to update and change categories
router.post('/updateCategory', ensureAuthenticated, function(req, res) {
    var id = req.body.id
    console.log(req.body.categoryKey, req.body.Image)
    categories.findOne({_id: id}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            console.log(result)
        }
    })
    categories.updateOne({ _id: id}, {$set : {  CategoryKey: req.body.categoryKey, Image: req.body.Image}}, {upsert: true}, function(error, res) {
        if (error) {
            console.log(error)
        }
    })
    res.send('/categories')
})

router.post('/createCategory', ensureAuthenticated, function(req, res) {
    var id = makeid(24)
    var obj = {
        CategoryKey: req.body.categoryKey,
        Image: req.body.Image,
        _id: id
    }
    categories.create(obj, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/categories')
        }
    })
})

router.post('/deleteCategory', ensureAuthenticated, function(req, res) {
    var id = req.body.id
    categories.deleteOne({_id: id}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/categories')
        }
    })
})






//banner posts to update and change banners
router.post('/createBanner', ensureAuthenticated, function(req, res) {
    //console.log(req.body)
    var datetime = new Date();
    var date = datetime.toISOString().split("T", 1);

    var obj = {
        title: req.body.title,
        color: req.body.color,
        textColor: req.body.textColor,
        additionalInfo: req.body.additionalInfo,
        date: date[0],
        active: req.body.active
    }

    banners.updateMany({}, {$set: {active: false}}, function(error){
        if(error) {
            console.log(error)
        }
    })

    banners.create(obj, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/banners')
        }
    })

})






//items posts to update and change items
router.post('/updateItem', ensureAuthenticated, function(req, res) {
    var id = req.body.id
    var obj = {
        Title: req.body.title,
        Image: req.body.image,
        Price: req.body.price,
        Description: req.body.description
    }
    items.updateOne({_id : id}, {$set: obj}, function(error, result) {
        if (error) {
            console.error("blue fuck off")
        } else {
            res.send("e")
        }
    })
})





//products post to update a product
router.post('/updateProduct', ensureAuthenticated, async function(req, res) {

    var productId = req.body.id
    var title = req.body.title
    var image = req.body.image
    var description = req.body.description
    var productkey = req.body.productkey

    console.log(req.body)

    await products.findOne({ _id: productId}, function(error, product) {
        if(error) {
            console.error(error)
        } else{
            var productKeyMain = product.ProductKey
            items.updateMany({ ProductKey: productKeyMain }, {$set: {ProductKey: productkey}}, function(error, result) {
                if(error) {
                    console.log(error)
                } else{
                    console.log(result)
                }
            })
        }
    })
    
    products.updateOne({ _id : productId }, {$set: {Title: title, Image: image, Description: description, ProductKey: productkey }}, function (error, result) {
        if(error) {
            console.log(error)
        } else{
            res.send('e')
        }
    })
})





//count document to return stock to the user on click
router.post('/getStock', ensureAuthenticated, function(req, res) {
    var id = req.body.id
    accounts.countDocuments( {itemID : id, availability : "true" }, function(error, stock) {
        if (error) {
            console.log(error) 
        } else {
            res.send(stock.toString())
        }
    })
})





//update the state of accounts
router.post('/changeState', ensureAuthenticated, function(req, res) {
    const inverse = {
        "true" : "false",
        "false" : "true"
    }

    var id = req.body.id
    accounts.updateOne({ _id: id }, {availability : inverse[req.body.availability]}, function(error, result) {
        if (error) {
            console.error(error)
        } else {
            console.log(result)
            res.send("e")
        }
    })
})

function encrypt(value) {
    var mykey = crypto.createCipher('aes-128-cbc', process.env.KEY);
    var mystr = mykey.update(value, 'utf8', 'hex')
    mystr += mykey.final('hex');
    return mystr;
}


//add accounts post route
router.post('/addAccounts', ensureAuthenticated, function(req, res) {
    var accountsJson = JSON.parse(req.body.accounts);
    var id = req.body.id;


    for (item in accountsJson.accounts) {
        var obj = accountsJson.accounts[item]
        var username = encrypt(obj.username)
        var password = encrypt(obj.password)

        accounts.create({itemID: id, email: username, password: password, availability: "true"}, function(error, result) {
            if (error) {
                console.error(error)
            } else {
                console.log(result)
            }
        })
    };
})

router.post('/sendShutdown', ensureAuthenticated, function(req, response) {

    var data = JSON.stringify({key : req.body.shutdownKey.toString()})
    const options = {
        hostname: 'fbbsvr.ddns.net',
        port: 80,
        path: '/secureShutdown',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
    }
      
    const request = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', (d) => {
            if (d.toString() == "e") {
                response.send('Incorrect Password')
            }
        })
    })
      
    request.on('error', (error) => {
        console.error(error)
        if(error.errno == "ECONNRESET") {
            response.send("Success! Server Shutdown Succeeded")
        }
    })
    
    request.write(data)
    request.end()
})


///secureShutdown
module.exports = router;