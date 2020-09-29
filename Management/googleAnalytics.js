
const { google } = require("googleapis");
var analytics = google.analytics("v3");
var ApiKeyFile = require("./worldplugs-289914-103e145c01fc.json");
var Key = getdefaultObj(ApiKeyFile);
function getdefaultObj(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var viewID = "ga:229244768";

var jwtClient = new google.auth.JWT(Key.default.client_email, null, Key.default.private_key, ["https://www.googleapis.com/auth/analytics.readonly"], null);


async function queryData(analytics, dimensions, metrics) {
    var query = await analytics.data.ga.get({
        "auth" : jwtClient,
        "ids": viewID,
        "dimensions" : dimensions,
        "metrics": metrics,
        "start-date": "30daysAgo",
        "end-date": "today",
    }).then(response => response).catch(error => error);
    return query
}

module.exports = queryData