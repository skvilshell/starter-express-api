const Route = require("./route"),
SqlString = require("sqlstring"),
ExpressValidator = require("express-validator");

class RouteRemoveNumber extends Route {

    constructor () {
        super("/api/removenumber");
    }

    getRoute (req, res) {
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
        global.database.query( SqlString.format("DELETE `numbers` FROM `numbers` LEFT JOIN `properties` ON `properties`.`id` = `numbers`.`property_id` WHERE `numbers`.`id` = ? AND `properties`.`user_id` = ?;", [req.query.property_id, req.user.id]) ).then(function (result) {
            if (result.affectedRows > 0)
                res.status(200).json({ message: "Successfully" });
            else
                res.status(503).json({ message: "Number not found" });
        }, function (err) {
            res.status(503).json({ message: "Unknown error" });
        });
    }

    registerRoute (app) {
        app.get(this.route, [
            ExpressValidator.check("property_id").isInt()
        ], this.getRoute);
    }

}

module.exports = RouteRemoveNumber;
