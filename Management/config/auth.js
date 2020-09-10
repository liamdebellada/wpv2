const mongoose = require('mongoose');
const grouplinks = require('../models/groupLinks')

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            if (req.user.requirePasswordChange[0] == "true") {
                res.redirect(req.user.requirePasswordChange[1])
            } else {
                if (req.session.passport.authenticated == undefined) {
                    res.redirect('/2fa')
                } else {
                    return next();
                }
            }
        } else {
            req.flash('error_msg', 'Please log in to head to the dashboard!');
            res.redirect('/');
        }
        
    },
    ensureNotAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return res.redirect('/dashboard')
        }
        return next();
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.group == "Admin") {
                return next();
            }
            res.redirect('/dashboard')
            
        }
        
    },
    ensurePermissions: function(requestedURL) {
        return function(req, res, next) {
            if (req.isAuthenticated()) {

                grouplinks.findOne({URL: 'https://admin.worldplugs.net' + requestedURL}, function(error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        if (result.Ranks.includes(req.user.group)) {
                            return next();
                        } else {
                            res.redirect('/dashboard')
                        }
                    }
                })
                
            }
        }
    },
    ensure2fa: function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.requirePasswordChange[0] == "true") {
                res.redirect(req.user.requirePasswordChange[1])
            } else {
                if (req.session.passport.authenticated == undefined) {
                    return next();
                } else {
                    res.redirect('/dashboard')
                }
            }
        } else {
            req.flash('error_msg', 'Please log in to head to the dashboard!');
            res.redirect('/')
        }
    },
    getLinks: function(group, callback) {
        grouplinks.find({ Ranks: { $all: [group] }}, function (error, dashboardLinks) {
            if (error) {
                console.log(error)
            } else {
                return callback(dashboardLinks)
            }
        })
    },
    logoutAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/')
        }
    }
    
    
}