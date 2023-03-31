const express = require("express"),
fs = require("fs"),
https = require("http"),
fileUpload = require("express-fileupload"),

app = express(),
server = https.createServer({
	// key: fs.readFileSync("key", "utf8"),
	// cert: fs.readFileSync("pem", "utf8")
}, app),

DatabaseMysql = require("./DatabaseMysql"),

RouteAuth = require("./routes/RouteAuth"),
RouteLogin = require("./routes/RouteLogin"),
RouteUser = require("./routes/RouteUser"),
RouteRegister = require("./routes/RouteRegister"),
RouteUpdateNumber = require("./routes/RouteUpdateNumber"),
RouteUpdatePage = require("./routes/RouteUpdatePage"),
RouteAddImage = require("./routes/RouteAddImage"),
RouteRemovePage = require("./routes/RouteRemovePage"),
RouteRemoveNumber = require("./routes/RouteRemoveNumber"),

RouteGetCards = require('./routes/GetRequests/RouteGetCards'),
RouteGetPlace = require('./routes/GetRequests/RouteGetPlace'),
RouteGetMetroAndDistricts = require('./routes/GetRequests/RouteGetMetroAndDistricts'),

SERVER_HOST = "0.0.0.0",
SERVER_PORT = 8080;

require("dotenv").config();

global.NUMBER_FEATURES = [];
global.NUMBER_TYPES = [];
global.PROPERTY_SERVICES = [];
global.RENTAL_HOURS = [];
global.DISTRICTS = [];
global.METROS = [];
global.database = new DatabaseMysql(process.env.MYSQL_HOST, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_DATABASE);

global.GetDistrict = function (id) {
    for (let district of global.DISTRICTS)
        if (district.id === id)
            return district;
    return null;
};

global.GetMetro = function (id) {
    for (let metro of global.METROS)
        if (metro.id === id)
            return metro;
    return null;
};

global.GetRentalHour = function (id) {
    for (let rent of global.RENTAL_HOURS)
        if (rent.id === id)
            return rent;
    return null;
};

global.GetNumberFeature = function (id) {
    for (let feature of global.NUMBER_FEATURES)
        if (feature.id === id)
            return feature;
    return null;
};

global.GetNumberType = function (id) {
    for (let type of global.NUMBER_TYPES)
        if (type.id === id)
            return type;
    return null;
};

global.GetPropertyService = function (id) {
    for (let service of global.PROPERTY_SERVICES)
        if (service.id === id)
            return service;
    return null;
};

global.UpdateStatic = function () {
    global.database.query("SELECT * FROM `number_features`;").then(function (number_features) {
        global.NUMBER_FEATURES = number_features;
        global.database.query("SELECT * FROM `number_types`;").then(function (number_types) {
            global.NUMBER_TYPES = number_types;
            global.database.query("SELECT * FROM `property_services`;").then(function (property_services) {
                global.PROPERTY_SERVICES = property_services;
                global.database.query("SELECT * FROM `rental_hours`;").then(function (rental_hours) {
                    global.RENTAL_HOURS = rental_hours;
                    global.database.query("SELECT * FROM `districts`;").then(function (districts) {
                        global.DISTRICTS = districts;
                        global.database.query("SELECT * FROM `metros`;").then(function (metros) {
                            global.METROS = metros;
                        });
                    });
                });
            });
        });
    });
};

process.on("uncaughtException", function (err) {
	console.log(err);
});

app.use( express.json() );
app.use( express.static("public") );
app.use( fileUpload({ limits: { fileSize: 5000000 }, abortOnLimit: true }) );
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

new RouteAuth().registerRoute(app);
new RouteLogin().registerRoute(app);
new RouteUser().registerRoute(app);
new RouteRegister().registerRoute(app);
new RouteUpdateNumber().registerRoute(app);
new RouteUpdatePage().registerRoute(app);
new RouteAddImage().registerRoute(app);
new RouteRemovePage().registerRoute(app);
new RouteRemoveNumber().registerRoute(app);
new RouteGetCards().registerRoute(app);
new RouteGetPlace().registerRoute(app);
new RouteGetMetroAndDistricts().registerRoute(app);

server.listen(SERVER_PORT, SERVER_HOST, function () {
    console.log(`Server listening on ${SERVER_HOST}:${SERVER_PORT}`);
});

setInterval(global.UpdateStatic, 1000 * 60 * 10);
global.UpdateStatic();
