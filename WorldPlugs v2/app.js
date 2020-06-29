
// App Modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose')
var bodyParser = require('body-parser');

// Use Express Framework
const app = express();

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






// Start server

var server = app.listen(80, '192.168.1.225')
var io = require('socket.io').listen(server);
io.on('connection', function(client) {
	client.on('join', function(data) {
        //console.log("connected")
    })
})
app.io = io;