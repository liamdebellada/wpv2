
//Package Dependencies
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

var EV = require('dotenv').config({ path: '../.env' })

const app = express();

app.use(session({
    secret: '8jcY!vo1a6u',
    saveUninitialized: true,
    resave: true
}));

// Passport Config
require('./config/passport')(passport)

// DB Config

const db = require('./config/keys').MongoURI;

// Connect to Mongo

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connection Successful'))
.catch(err => err);

// EJS
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('view engine', 'ejs')

// Bodyparser


// Express Session



// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
// Connect flash

app.use(flash());

// Global Vars

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})



// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));




// Run Server
app.listen(5129, '77.68.92.74')

