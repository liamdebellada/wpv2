const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
var speakeasy = require('speakeasy')
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin, ensure2fa , logoutAuthenticated} = require('../config/auth');
var crypto = require("crypto");
const qrcode = require('qrcode')

const User = require('../models/User')


const Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

// User Login
router.get('/', ensureNotAuthenticated, function(req,res) {
    res.render('login', {layout: "layout.ejs"})
})

// User Register


// Login Handle
router.post('/login', recaptcha.middleware.verify, (req, res, next) => {
    if (!req.recaptcha.error) {
        passport.authenticate('local', {
            successRedirect: '/2fa',
            failureRedirect: '/',
            failureFlash: true
        })(req, res, next);
    } else {
        req.flash('error_msg', 'Please complete the captcha before continuing')
        res.redirect('/')
    }
})



router.get('/2fa', ensure2fa, function(req, res) {
    res.render('2fa.ejs')
}) 


router.post('/2faCheck', ensure2fa, function(req, res) {
    var verified = speakeasy.totp.verify({ 
        secret: req.user.secret.toString(),
        encoding: 'base32',
        token: req.body.token.toString().replace(' ', '')
    });
    if (verified) {
        req.session.passport.authenticated = true
        res.redirect('/dashboard')
    } else {
        req.flash('error_msg', 'Incorrect, please try again.')
        res.redirect('/2fa')
    }

})


// Logout Handle
router.get('/logout', logoutAuthenticated, (req, res) => {
    req.logout();
    req.session.destroy()
    res.redirect('/')
});

module.exports = router;