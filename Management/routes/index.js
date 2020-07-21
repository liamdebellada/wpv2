const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
} = require('../config/auth');
const {ECAKey} = require('../config/keys')
const mongoose = require('mongoose');
const crypto = require('crypto');
const assert = require('assert');

const banners = require('../models/banners');
const categories = require('../../models/categories')
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

module.exports = router;