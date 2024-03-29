// App Modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
var bodyParser = require('body-parser');
var EV = require('dotenv').config() 
const bcrypt = require('bcrypt')
var helmet = require('helmet')

//google analytics
const tracker = require('./exports/tracker.js')
const ExpressGA = require('express-universal-analytics')

//sessions
const session = require("express-session");
const nodemon = require('nodemon');
const functions = require('./exports/functions');
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
    uri: require('./config/keys').MongoURI,
    collection: 'Sessions',
    expires: 1000 * 60 * 60
});


store.on('error', function(error) {
    console.log(error); 
});

// Use Express Framework
const app = express();

//Analytics config
app.use(ExpressGA('UA-178419670-1'));

//disable headers
app.disable('x-powered-by')

//setup helmet headers
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());


app.use(function(req, res, next) {
    res.locals.session = req.session;
    next()
})

//configure express session
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 // 1h
    },
    store: store,
    secure: true,
    resave: true,
    saveUninitialized: false
}));


// DB Config
const db = require('./config/keys').MongoURI;

console.log("WorldPlugs.net")

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connection Successful'))
.catch(err => console.log("MongoDB connection successful"))



// Bodyparser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// EJS
app.use(express.static('public'))
app.use(expressLayouts);
app.set('view engine', 'ejs')

// Routes
app.use('/', function(req,res,next) {
    tracker.createTrack(req)
    next()
},require('./routes/index'));
app.use('/', require('./routes/payment'));
app.use('/', require('./routes/cart'));



app.use(function(req, res, next){
    res.status(404);
  
    // respond with html page
    if (req.accepts('html')) {
        functions.getPageLinks(function(links) {
            res.render('404', { links: links });
            return;
        }) 
    }
});


// Start server
var server = app.listen(4000, process.env.ADDRESS)
var io = require('socket.io').listen(server);
io.on('connection', function(client) {
	client.on('join', function(data) {
        //console.log("connected")
    })
})

app.enable('trust proxy')


app.io = io;