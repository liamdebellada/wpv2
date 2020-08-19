const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../config/auth');
var crypto = require("crypto");


const User = require('../models/User')


// User Login
router.get('/', ensureNotAuthenticated, (req, res) => res.render('login', {layout: "layout.ejs"}))

// User Register

// Register Handle
router.post('/register', ensureNotAuthenticated, ensureAdmin, (req, res) => {



    const {
        name,
        email,
        password,
        password2
    } = req.body;
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: 'Please fill in all fields'
        });
    }

    if (re.test(String(email).toLowerCase() != true)) {
        errors.push({
            msg: 'Email is not in the correct format.'
        });
    }


    // Check passwords match
    if (password !== password2) {
        errors.push({
            msg: 'Passwords do not match'
        });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({
            msg: 'Password should be at least 6 characters'
        })
    }


    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // Validation Passed
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({
                        msg: 'Email already exists!'
                    })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    var uid = Math.floor((Math.random() * 99999999999) + 10000000000);
                    var ECAUID = crypto.randomBytes(32).toString('hex');
                    const newUser = new User({
                        ECAUID,
                        uid,
                        name,
                        email,
                        password
                    });

                    // Hash Password

                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //Set password to hash
                        newUser.password = hash;

                        //Save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in')
                                res.redirect('/')
                            })
                            .catch(err => console.log(err))
                    }))

                };

            });
    };

});

// Login Handle
router.post('/login' , (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
})

// Logout Handle
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/')
});

module.exports = router;