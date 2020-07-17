
// App Modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose')
var bodyParser = require('body-parser');
var EV = require('dotenv').config()

//sessions
const session = require("express-session")
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
    uri: require('./config/keys').MongoURI,
    collection: 'Sessions'
});

store.on('error', function(error) {
    console.log(error);
});

// Use Express Framework
const app = express();

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
    resave: true,
    saveUninitialized: true
  }));


// DB Config
const db = require('./config/keys').MongoURI;



// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connection Successful'))
.catch(err => console.log(err));



// Bodyparser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());



// EJS
app.use(express.static('public'))
app.use(expressLayouts);
app.set('view engine', 'ejs')



// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/payment'));
app.use('/', require('./routes/cart'));


// Start server
var server = app.listen(80, process.env.ADDRESS)
var io = require('socket.io').listen(server);
io.on('connection', function(client) {
	client.on('join', function(data) {
        //console.log("connected")
    })
})
app.io = io;