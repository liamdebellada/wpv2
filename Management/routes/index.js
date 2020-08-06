const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    ensureAdmin
} = require('../config/auth');
const {
    ECAKey
} = require('../config/keys')
const mongoose = require('mongoose');
const crypto = require('crypto');
const assert = require('assert');
const bcrypt = require('bcrypt')

var http = require('http');

const banners = require('../models/banners');
const categories = require('../../models/categories')
const products = require('../../models/products')
const items = require('../../models/items')
const accounts = require('../../models/accounts')
const logs = require('../models/logs')
const users = require('../models/User')
const links = require('../models/links')
const e = require('express');

const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)


//discord config

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});
client.login('NzQwOTU4MzMxMzc5Nzc3NjU4.XywlOA.dQAzqV4rGRLOQgwQ5ovqBZrSLd4');



function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createDiscordAnnouncement(message, channelID) {
    client.channels.cache.get(channelID).send(message);
}

//static routes for rendering pages
router.get('/dashboard', ensureAuthenticated, (req, res) => {

    const uid = req.user.uid

    res.render('dashboard', {
        name: req.user.name,
        rank: req.user.group
    })
    
})

router.get('/logs', ensureAuthenticated, function (req, res) {
    logs.find({}, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.render('data-logs.ejs', {
                data: result
            })
        }
    })
})

router.get('/staff', ensureAuthenticated, ensureAdmin, function (req, res) {
    users.find({}, 'name email group', function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.render('staff.ejs', {
                staffAccounts: result
            })
        }
    })

})

router.get('/link-manager', ensureAuthenticated, ensureAdmin, function(req, res) {
    links.find({}, function(error, result) {
        if(error) {
            console.log(error)
        } else {
            console.log(result)
            res.render('links', {items: result})
        }
    })
})

router.post('/updateLink', ensureAuthenticated, ensureAdmin, async function(req, res) {
    var result = ""
    console.log(req.body)
    await links.updateOne({_id: req.body.id}, {title: req.body.Title, link: req.body.Url}, function(error, res) {
        if (error) {
            console.log(error)
            result = "/error"
        } else {
            result = "/link-manager"
        }
    })
    res.send(result)
})


router.post('/createItem', ensureAuthenticated, ensureAdmin, async function(req, res) {
    var categorykey = ""
    await products.findOne({ProductKey: req.body.productkey}, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            categorykey = result.CategoryKey
        }
    })
    if (req.body.announce == "true") {
        createDiscordAnnouncement(`@everyone A new item has been added to the ${req.body.productkey} Store: ${req.body.title}. https://worldplugs.net/products/${categorykey}/items/${req.body.productkey}`, "740961097267544077")
    } else {
        console.log("no announce")
    }

    var empty = []
    console.log(req.params)
    for (item in req.body) {
        if (req.body[item] == "") {
            empty.push(item)
        }
    }
    if (empty.length > 0) {
        res.send(`${empty.join()} Field is empty`)
    } else {
        items.create(
            {
            _id: makeid(24), 
            Title: req.body.title,
            Image: req.body.image,
            Price: req.body.price,
            Description: req.body.description, ProductKey: req.body.productkey, productState: "enabled"}, function(err, result) {
                if(err) {
                    console.error(err)
                } else {
                    res.send('s')
                }
            })
    }
})

router.post('/unlistItem', ensureAuthenticated, ensureAdmin, function(req, res) {
    items.updateOne({_id : req.body.id}, {productState: "disabled"}, function(err, data) {
        if(err) {
            console.log(err)
        } else {
            res.send('s')
        }
    })
})

router.post('/listItem', ensureAuthenticated, ensureAdmin, function(req, res) {
    items.updateOne({_id : req.body.id}, {productState: "enabled"}, function(err, data) {
        if(err) {
            console.log(err)
        } else {
            res.send('s')
        }
    })
})

router.post('/updateStaffAccount', ensureAuthenticated, ensureAdmin, function (req, res) {

    if (!Object.values(req.body).includes("")) {

        var accountID = req.body.id
        var accountName = req.body.name
        var accountEmail = req.body.email
        var accountGroup = req.body.group

        users.updateOne({
            _id: accountID
        }, {
            $set: {
                name: accountName,
                email: accountEmail,
                group: accountGroup
            }
        }, function (error, result) {
            if (error) {
                res.send("E").status(400).end()
            } else {
                console.log(result, accountID)
                if (result.n == 0) {
                    res.send("NA").status(401).end()
                } else {
                    if (result.nModified == 1) {
                        res.send("S").status(200).end()
                    } else if (result.nModified == 0) {
                        res.send("N").status(202).end()
                    }
                }
            }
        })

    } else {
        res.send("FC").status(406).end()
    }

})

router.post('/createStaffAccount', ensureAuthenticated, ensureAdmin, function(req, res) {
    users.findOne({email: req.body.email}).then(user => {
        if (user) {
            res.send('EE').status(400).end()
        } else {

            const createPasswordURL = 'https://admin.worldplugs.net/create-password/' + [...Array(70)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
            var name = req.body.name
            var email = req.body.email
            var password = [...Array(24)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
            var group = req.body.group

            const newUser = new users({
                name,
                email,
                password,
                group,
                requirePasswordChange: ["true", createPasswordURL],
            });

            newUser.save()

            res.send(createPasswordURL).status(200).end()
        }
    })
})

router.post('/revokeStaffAccount', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.body.id
    users.deleteOne({
        _id: id
    }, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.status(200).end()
        }
    })
})

router.post('/createResetPassword', ensureAuthenticated, ensureAdmin, function (req, res) {
    if (!Object.values(req.body).includes("")) {

        var accountID = req.body.id

        const resetPasswordURL = 'https://admin.worldplugs.net/reset-password/' + [...Array(70)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

        users.updateOne({
            _id: accountID
        }, {
            $set: {
                requirePasswordChange: ["true", resetPasswordURL]
            }
        }, function (error, result) {
            if (error) {
                console.log(error)
            } else {
                res.send(resetPasswordURL).end()
            }
        })



    } else {
        res.send("Missing User ID").status(406).end()
    }
})

router.get('/reset-password/:resetURL', function (req, res) {
    users.findOne({
        requirePasswordChange: {
            $all: ["true", 'https://admin.worldplugs.net/reset-password/' + req.params.resetURL.toString()]
        }
    }, function (error, result) {
        if (error) {
            console.log(error)
            res.redirect('/')
        } else {
            if (result == null) {
                res.redirect('/')
            } else {
                res.render('reset-password.ejs', {
                    aURL: result.requirePasswordChange[1],
                    header: "The Admins have requested a password reset. To continue please enter a new password",
                    subheader: "Please note this cannot be the same as your old password",
                    buttonText: "Change Password"
                })
            }
        }
    })
})

router.get('/create-password/:createURL', function (req, res) {
    users.findOne({
        requirePasswordChange: {
            $all: ["true", 'https://admin.worldplugs.net/create-password/' + req.params.createURL.toString()]
        }
    }, function (error, result) {
        if (error) {
            console.log(error)
            res.redirect('/')
        } else {
            if (result == null) {
                res.redirect('/')
            } else {
                res.render('reset-password.ejs', {
                    aURL: result.requirePasswordChange[1],
                    header: "Welcome to the WorldPlugs staff team!",
                    subheader: "Please enter a new password to continue to the management page.",
                    buttonText: "Create Password"
                })
            }
        }
    })
})

router.post('/password-update', recaptcha.middleware.verify, function (req, res) {
    if (!req.recaptcha.error) {

        if (req.body.password[0] == req.body.password[1]) {
            users.findOne({
                requirePasswordChange: {
                    $all: ["true", req.body.aURL.toString()]
                }
    
            }, function (error, result) {
                if (error) {
                    res.redirect('/')
                } else {
                    if (result == null) {
                        res.redirect('/')
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.password[0].toString(), salt, (err, hash) => {
                                if (err) throw err;
                                users.updateOne({_id: result._id}, {$set: { requirePasswordChange: ["false"], password: hash}}, function (error, result) {
                                    res.redirect('/logout')
                                })
                            });
                        });

                    }
                }
            })
        }
    } else {
        res.redirect('/')
    }
})

router.get('/banners', ensureAuthenticated, ensureAdmin, function (req, res) {
    banners.find({}, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.render('banners.ejs', {
                data: result
            })
        }
    })
})

router.get('/categories', ensureAuthenticated, ensureAdmin, async function (req, res) {
    var results = []
    await categories.find({}, function (error, result) {
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

router.get('/products', ensureAuthenticated, ensureAdmin, async function (req, res) {
    var results = []
    await categories.find({}, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            results.push(result)
        }
    })
    res.render('products.ejs', {
        data: results
    })
})

router.get('/browseProducts/:categoryKey', ensureAuthenticated, ensureAdmin, function (req, res) {
    var key = req.params.categoryKey.toString();
    products.find({
        CategoryKey: key
    }, function (error, results) {
        if (error) {
            console.log(error)
        } else {
            res.render('products-view', {
                products: results,
                CategoryKey: key
            })
        }
    })
})

router.post('/addProduct', ensureAuthenticated, ensureAdmin, function (req, res) {
    if (req.body.announce == "true") {
        createDiscordAnnouncement(`@everyone A new product has been added to the ${req.body.CategoryKey} Category: ${req.body.title}. Access the products page here: __https://worldplugs.net/products/${req.body.CategoryKey}__`, "740961097267544077")
    } else {
        console.log("no announce")
    }

    var categorykey = req.body.CategoryKey
    var title = req.body.title
    var productkey = req.body.productKey
    var image = req.body.imageURL
    var description = req.body.description

    products.find({
        CategoryKey: categorykey, ProductKey: productkey
    }, function(error, result){
        if (error) {
            console.error(error)
        } else {
            if (result.length < 1) {
                products.create({
                    _id: makeid(24),
                    CategoryKey: categorykey,
                    ProductKey: productkey,
                    Title: title,
                    Image: image,
                    Description: description,
                    productState: "enabled",
                }, function (error, result) {
                    if (error) {
                        console.log(error)
                        res.status(403).end()
                    } else {
                        console.log(result)
                        res.send("e")
                    }
                })
                
            } else{
                res.status(403).end()
            }
        }
    })

    console.log(title, productkey, image, description)
})

router.post('/renableProduct', ensureAuthenticated, ensureAdmin, function (req, res) {
    productID = req.body.productID.toString()

    products.updateOne({_id: productID}, {productState: "enabled"}, function(error, result) {
        if (error) {
            res.send("f").status(200).end()
        } else {
            res.send("e").status(200).end()
    }})
})

router.post('/unlistProduct', ensureAuthenticated, ensureAdmin, function (req, res) {
    productID = req.body.productID.toString()

    products.updateOne({_id: productID}, {productState: "disabled"}, function(error, result) {
        if (error) {
            res.send("f").status(200).end()
        } else {
            res.send("e").status(200).end()
    }})
})

router.get('/browseItems/:productKey', ensureAuthenticated, ensureAdmin, function (req, res) {
    var key = req.params.productKey.toString()
    items.find({
        ProductKey: key,
        productState: "enabled"
    }, function (error, results) {
        if (error) {
            console.error(error)
        } else {
            items.find({ProductKey: key,
                productState: "disabled"
            }, function(err, listResult) {
                res.render('items-view', {
                    items: results,
                    unlisted: listResult
                })
            })
        }
    })
})

router.get('/manageAccounts/:id', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.params.id.toString()
    accounts.find({
        itemID: id
    }, function (error, result) {
        if (error) {
            console.error(error)
        } else {
            res.render('accounts-view', {
                accounts: result
            })
        }
    })
})


router.get('/admin', ensureAuthenticated, ensureAdmin, function (req, res) {
    res.render('admin')
})


//category posts to update and change categories
router.post('/updateCategory', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.body.id
    console.log(req.body.categoryKey, req.body.Image)
    categories.findOne({
        _id: id
    }, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            products.updateMany({CategoryKey: result.CategoryKey}, {CategoryKey : req.body.categoryKey}, function(error, resulttt) {
                if (error) {
                    console.log(error)
                } else {
                    console.log(resulttt)
                    categories.updateOne({
                        _id: id
                    }, {
                        $set: {
                            CategoryKey: req.body.categoryKey,
                            Image: req.body.Image
                        }
                    }, {
                        upsert: true
                    }, function (error, res) {
                        if (error) {
                            console.log(error)
                        }
                    })
                    res.send('/categories')
                }
            })
        }
    })
    
})

router.post('/createCategory', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = makeid(24)
    var obj = {
        CategoryKey: req.body.categoryKey,
        Image: req.body.Image,
        _id: id
    }

    categories.create(obj, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/categories')
        }
    })
})

router.post('/deleteCategory', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.body.id
    categories.deleteOne({
        _id: id
    }, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/categories')
        }
    })
})






//banner posts to update and change banners
router.post('/createBanner', ensureAuthenticated, ensureAdmin, function (req, res) {
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

    banners.updateMany({}, {
        $set: {
            active: false
        }
    }, function (error) {
        if (error) {
            console.log(error)
        }
    })

    banners.create(obj, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/banners')
        }
    })

})






//items posts to update and change items
router.post('/updateItem', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.body.id
    var obj = {
        Title: req.body.title,
        Image: req.body.image,
        Price: req.body.price,
        Description: req.body.description,
        productState: "enabled"
    }
    items.updateOne({
        _id: id
    }, {
        $set: obj
    }, function (error, result) {
        if (error) {
            console.error(error)
        } else {
            res.send("e")
        }
    })
})





//products post to update a product
router.post('/updateProduct', ensureAuthenticated, ensureAdmin, async function (req, res) {

    var productId = req.body.id
    var title = req.body.title
    var image = req.body.image
    var description = req.body.description
    var productkey = req.body.productkey

    console.log(req.body)

    await products.findOne({
        _id: productId
    }, function (error, product) {
        if (error) {
            console.error(error)
        } else {
            var productKeyMain = product.ProductKey
            items.updateMany({
                ProductKey: productKeyMain
            }, {
                $set: {
                    ProductKey: productkey
                }
            }, function (error, result) {
                if (error) {
                    console.log(error)
                } else {
                    console.log(result)
                }
            })
        }
    })

    products.updateOne({
        _id: productId
    }, {
        $set: {
            Title: title,
            Image: image,
            Description: description,
            ProductKey: productkey
        }
    }, function (error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('e')
        }
    })
})





//count document to return stock to the user on click
router.post('/getStock', ensureAuthenticated, ensureAdmin, function (req, res) {
    var id = req.body.id
    accounts.countDocuments({
        itemID: id,
        availability: "true"
    }, function (error, stock) {
        if (error) {
            console.log(error)
        } else {
            res.send(stock.toString())
        }
    })
})





//update the state of accounts
router.post('/changeState', ensureAuthenticated, ensureAdmin, function (req, res) {
    const inverse = {
        "true": "false",
        "false": "true"
    }

    var id = req.body.id
    accounts.updateOne({
        _id: id
    }, {
        availability: inverse[req.body.availability]
    }, function (error, result) {
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
router.post('/addAccounts', ensureAuthenticated, ensureAdmin, function (req, res) {
    var accountsJson = JSON.parse(req.body.accounts);
    var id = req.body.id;


    for (item in accountsJson.accounts) {
        var obj = accountsJson.accounts[item]
        var username = encrypt(obj.username)
        var password = encrypt(obj.password)

        accounts.create({
            itemID: id,
            email: username,
            password: password,
            availability: "true"
        }, function (error, result) {
            if (error) {
                console.error(error)
            } else {
                console.log(result)
            }
        })
    };
})

router.post('/sendShutdown', ensureAdmin, ensureAuthenticated, function (req, response) {

    var data = JSON.stringify({
        key: req.body.shutdownKey.toString()
    })
    const options = {
        hostname: 'worldplugs.net',
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
        if (error.errno == "ECONNRESET") {
            response.send("Success! Server Shutdown Succeeded")
        }
    })

    request.write(data)
    request.end()
})

router.post('/sendAlert', ensureAuthenticated, ensureAdmin, function(req, res) {
    var icons = {
        "Shutdown Alert": ":red_circle:",
        "Update": ":blue_circle:",
        "General": ":white_circle:"
    }

    var type = req.body.type
    var message = req.body.message
    createDiscordAnnouncement(`-@here\n__**${type}:**__ ${icons[type]}\n***${message}***`, "740961097267544077")
}) 


///secureShutdown
module.exports = router;