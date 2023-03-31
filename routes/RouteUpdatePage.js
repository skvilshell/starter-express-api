const Route = require("./route"),
SqlString = require("sqlstring"),
ExpressValidator = require("express-validator"),
Util = require("../Util");

class RouteUpdatePage extends Route {

    constructor () {
        super("/api/updatepage");
    }

    getRoute (req, res) {
        var property_id,
        name,
        description,
        address,
        metro_min,
        images_id,
        check_in_before,
        check_in_after,
        services,
        district_id,
        metro_id,
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
        property_id = req.body.property_id;
        name = req.body.name;
        description = req.body.description;
        district_id = req.body.district_id;
        metro_id = req.body.metro_id;
        address = req.body.address;
        images_id = req.body.images_id;
        services = req.body.services;
        metro_min = req.body.metro_min;
        check_in_before = Util.getMysqlTime(req.body.check_in_before);
        check_in_after = Util.getMysqlTime(req.body.check_in_after);
        global.database.query(
            property_id != null ?
            SqlString.format("UPDATE `properties` SET `name`=?,`district_id`=?,`metro_id`=?,`metro_min`=?,`address`=?,`status`=0,`description`=?,`check_in_before`=?,`check_in_after`=?,`updated_at`=CURRENT_TIME() WHERE `id`=? AND `user_id`=?;", [name, district_id, metro_id, metro_min, address, description, check_in_before, check_in_after, property_id, req.user.id]) :
            SqlString.format("INSERT INTO `properties`(`name`, `user_id`, `district_id`, `metro_id`, `metro_min`, `address`, `description`, `check_in_before`, `check_in_after`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", [name, req.user.id, district_id, metro_id, metro_min, address, description, check_in_before, check_in_after])
        ).then(function (result) {
            if (result.affectedRows < 1) {
                res.status(503).json({ message: "Property not found" });
                return;
            }
            if (property_id == null)
                property_id = result.insertId;
            promises = [];
            promises.push( global.database.query( SqlString.format("DELETE FROM `service_property` WHERE `property_id`=?", [property_id]) ) );
            promises.push( global.database.query( SqlString.format("DELETE FROM `property_photos` WHERE `property_id`=?", [property_id]) ) );
            for (let service of services)
                promises.push( global.database.query( SqlString.format("INSERT INTO `service_property`(`property_id`, `service_id`, `description`) VALUES (?, ?, ?);", [property_id, service.id, service.description]) ) );
            for (let photo_id of images_id)
                promises.push( global.database.query( SqlString.format("INSERT INTO `property_photos`(`property_id`, `photo_id`) VALUES (?, ?);", [property_id, photo_id]) ) );
            Promise.all(promises).then(function () {
                res.status(200).json({ property_id });
            }, function (err) {
                res.status(200).json({ property_id });
            });
        }, function (err) {
            res.status(503).json({ message: "Unknown error" });
        });
    }

    registerRoute (app) {
        app.post(this.route, [
            ExpressValidator.body("property_id").optional().isInt(),
            ExpressValidator.body("name").notEmpty().trim().escape().isLength({ max: 100 }),
            ExpressValidator.body("description").notEmpty().trim().escape().isLength({ max: 10000 }),
            ExpressValidator.body("district_id").isInt().custom(function (value) {
                return global.GetDistrict(value) != null;
            }),
            ExpressValidator.body("metro_id").isInt().custom(function (value) {
                return global.GetMetro(value) != null;
            }),
            ExpressValidator.body("address").notEmpty().trim().escape().isLength({ max: 100 }),
            ExpressValidator.body("images_id").isArray({ max: 30 }).customSanitizer(function (value) {
                return Util.checkIds(value);
            }),
            ExpressValidator.body("services").isArray().customSanitizer(function (value) {
                return Util.checkServices(value);
            }),
            ExpressValidator.body("metro_min").isInt(),
            ExpressValidator.body("check_in_before").isInt(),
            ExpressValidator.body("check_in_after").isInt()
        ], this.getRoute);
    }

}

module.exports = RouteUpdatePage;
