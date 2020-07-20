const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
} = require('../config/auth');
const {ECAKey} = require('../config/keys')
const mongoose = require('mongoose');
const crypto = require('crypto');
const assert = require('assert');

const banners = require('../models/banners')


var algorithm = 'aes-256-cbc'

router.get('/bcrypt', (req, res) => {

    var ECAUID = '7a83fdda3ad8283316ef5db8e329f88a';
    var key = ECAKey + ECAUID

    var mykey = crypto.createCipher('aes-256-cbc', key)
    var mystr = mykey.update('', 'utf8', 'hex');
    mystr += mykey.final('hex');
    console.log(mystr)
    
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {

        const uid = req.user.uid


        res.render('dashboard', {
            name: req.user.name,
        })   
    }
)

router.get('/banners', function(req, res) {
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


router.post('/createBanner', function(req, res) {
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

    banners.create(obj, function(error, result) {
        if (error) {
            console.log(error)
        } else {
            res.send('/banners')
        }
    })

})

module.exports = router;