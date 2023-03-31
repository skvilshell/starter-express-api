const Route = require("./route"),
SqlString = require("sqlstring"),
ExpressValidator = require("express-validator"),
Util = require("../Util");

class RouteUpdateNumber extends Route {

    constructor () {
        super("/api/updatenumber");
    }

    getRoute (req, res) {
        var number_id,
        property_id,
        name,
        type,
        images_id,
        features,
        rental_hours,
        promises;
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
        }
        if (req.user.is_email_confirmed != 1) {
            res.status(401).json({ message: "Email not confirmed" });
            return;
        }
        if ( !ExpressValidator.validationResult(req).isEmpty() ) {
            res.status(503).json({ message: "Invalid request" });
            return;
        }
        number_id = req.body.number_id;
        property_id = req.body.property_id;
        name = req.body.name;
        type = req.body.type;
        images_id = req.body.images_id;
        features = req.body.features;
        rental_hours = req.body.rental_hours;
        global.database.query( SqlString.format("SELECT * FROM `properties` WHERE `id` = ? AND `user_id` = ?;", [property_id, req.user.id]) ).then(function (properties) {
            if (properties.length != 1) {
                res.status(503).json({ message: "Property not found" });
                return;
            }
            global.database.query(
                number_id != null ?
                SqlString.format("UPDATE `numbers` SET `name`=?,`number_type_id`=?,`updated_at`=CURRENT_TIME() WHERE `id`=? AND `property_id`=?;", [name, type, number_id, property_id]) :
                SqlString.format("INSERT INTO `numbers`(`name`, `property_id`, `number_type_id`) VALUES (?, ?, ?);", [name, property_id, type])
            ).then(function (result) {
                if (result.affectedRows < 1) {
                    res.status(503).json({ message: "Number not found" });
                    return;
                }
                if (number_id == null)
                    number_id = result.insertId;
                
                promises = [];
                promises.push( global.database.query( SqlString.format("DELETE FROM `feature_number` WHERE `number_id`=?", [number_id]) ) );
                promises.push( global.database.query( SqlString.format("DELETE FROM `rental_prices` WHERE `number_id`=?", [number_id]) ) );
                promises.push( global.database.query( SqlString.format("DELETE FROM `number_photos` WHERE `number_id`=?", [number_id]) ) );
                for (let feature of features)
                    promises.push( global.database.query( SqlString.format("INSERT INTO `feature_number`(`number_id`, `feature_id`, `description`) VALUES (?, ?, ?);", [number_id, feature.id, feature.description]) ) );
                for (let rental_hour of rental_hours)
                    promises.push( global.database.query( SqlString.format("INSERT INTO `rental_prices`(`number_id`, `rental_hour_id`, `price`) VALUES (?, ?, ?);", [number_id, rental_hour.id, rental_hour.price]) ) );
                for (let photo_id of images_id)
                    promises.push( global.database.query( SqlString.format("INSERT INTO `number_photos`(`number_id`, `photo_id`) VALUES (?, ?);", [number_id, photo_id]) ) );
                Promise.all(promises).then(function () {
                    res.status(200).json({ number_id });
                }, function (err) {
                    res.status(200).json({ number_id });
                });
            }, function (err) {
                res.status(503).json({ message: "Unknown error" });
            });
        }, function (err) {
            res.status(503).json({ message: "Unknown error" });
        });
    }

    registerRoute (app) {
        app.post(this.route, [
            ExpressValidator.body("number_id").optional().isInt(),
            ExpressValidator.body("property_id").isInt(),
            ExpressValidator.body("name").notEmpty().trim().escape().isLength({ max: 100 }),
            ExpressValidator.body("type").isInt().custom(function (value) {
                return global.GetNumberType(value) != null;
            }),
            ExpressValidator.body("images_id").isArray({ max: 30 }).customSanitizer(function (value) {
                return Util.checkIds(value);
            }),
            ExpressValidator.body("features").isArray().customSanitizer(function (value) {
                return Util.checkFeatures(value);
            }),
            ExpressValidator.body("rental_hours").isArray().customSanitizer(function (value) {
                return Util.checkRentalHours(value);
            })
        ], this.getRoute);
    }

}

module.exports = RouteUpdateNumber;
