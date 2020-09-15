const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            // Match User
            User.findOne({
                    email: email
                })
                .then(user => {
                    if (!user) {
                        return done(null, false, {
                            message: 'Your email or password is incorrect.'
                        });
                    }

                    
                    // Match Password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            return done(err)
                        };

                        if (isMatch) {
                            
                            // user.test = "hello!"
                            // console.log(Object.keys(user));
                            return done(null, user);

                        } else {
                            return done(null, false, {
                                message: 'Your email or password is incorrect'
                            })
                        }
                    });

                })
                .catch(err => console.log(err))
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            user = user.toObject()
            if (user.authenticated == false || user.authenticated == undefined) {     
                user.authenticated = false
                done(err, user);
            } else {
                done(err, user);
            }
            
        });
    });

}