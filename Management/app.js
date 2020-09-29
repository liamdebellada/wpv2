
//Package Dependencies
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const sessions = require('../models/sessionTable')
const flash = require('connect-flash');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
var EV = require('dotenv').config({ path: '../.env' })
const app = express();
const {
    ensureAuthenticated, 
    ensureAdmin,
    ensurePermissions,
    getLinks
} = require('./config/auth');

const axios = require('axios');
const osu = require('node-os-utils')
const successOrders = require('../models/successOrders')
var cpu = osu.cpu
var mem = osu.mem
var drive = osu.drive
var netstat = osu.netstat
getNetwork = async () => {return await netstat.stats().then(net => net)}
getCpu = async () => {return await cpu.usage().then(p => p)}
getMem = async () => {return await mem.info().then(info => info)}
getDisk = async () => {return await drive.info().then(driveUsage => driveUsage)}
getSessionCount = async () => {return await sessions.countDocuments({}).then(sessionNum => sessionNum).catch(sessionError => sessionErr)}
getCartSessions = async () => {return await sessions.countDocuments( { 'session.cart': { $exists: true }, 'session.cart': { $size: 1 } } ).then(result => result).catch(sessionCartErr => sessionCartErr)}
getOrderSessions = async () => {return await sessions.countDocuments( { 'session.order': { $exists: true }, 'session.order': { $size: 1 } } ).then(orderResult => orderResult).catch(sessionOrderErr => sessionOrderErr)}
getSuccessPages = async () => {return await successOrders.countDocuments({}).then(successNum => successNum).catch(err => err)}
const http = require('http').createServer(app);
const io = require('socket.io')(http);

getSiteStatus = async () => {return await axios.get('https://worldplugs.net/getStatus/key=tracked48').then(response => response.data).catch(error => error)}

io.on('connection', async (socket) => {
    socket.emit('netData', await getNetwork())
    socket.emit('siteStatus', await getSiteStatus())
    socket.emit('usage', await getCpu())
    socket.emit('memdata', await getMem())
    socket.emit('diskUsage', await getDisk())
    socket.emit('sessionCount', await getSessionCount())
    socket.emit('sessionCartCount', await getCartSessions())
    socket.emit('getOrderSessions', await getOrderSessions())
    setInterval(async function() {
        socket.emit('usage', await getCpu())
        socket.emit('memdata', await getMem())
        socket.emit('netData', await getNetwork())
        socket.emit('sessionCount', await getSessionCount())
        socket.emit('sessionCartCount', await await getCartSessions())
        socket.emit('getOrderSessions', await getOrderSessions())
        socket.emit('getSuccessSessions', await getSuccessPages())
    }, 3000)
    setInterval(async function() {
        socket.emit('siteStatus', await getSiteStatus())
    }, 10000)
    setInterval(async function() {
        socket.emit('diskUsage', await getDisk())
    }, 600000)
});


var userSession = new MongoDBStore({
    uri: require('./config/keys').MongoURI,
    collection: 'userSession',
    expires: 1000 * 60 * 60
});


userSession.on('error', function(error) {
    console.log(error); 
});

app.use(session({
    secret: '8jcY!vo1a6u',
    secure: true,
    saveUninitialized: true,
    resave: true,
    store: userSession
}));

app.set('trust proxy', 1);


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
app.use(ensureAuthenticated, express.static(__dirname + '/authenticated'));


// Run Server
http.listen(5129, '77.68.92.74')

