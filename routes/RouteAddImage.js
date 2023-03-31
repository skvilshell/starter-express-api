const Route = require("./Route"),
uuid = require("uuid"),
path = require("path"),
SqlString = require("sqlstring"),
fs = require("fs");

class RouteAddImage extends Route {

    constructor () {
        super("/api/addimage");
    }

    getRoute (req, res) {
        var image,
        image_url,
        filepath;
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
        }
        if (req.user.is_email_confirmed != 1) {
            res.status(401).json({ message: "Email not confirmed" });
            return;
        }
        if ( req.files == null || !(image = req.files.image) || /^image/.test(image) ) {
            res.status(503).json({ message: "Invalid request" });
            return;
        }
        image_url = uuid.v4() + path.extname(image.name);
        filepath = "./public/files/" + image_url;
        image.mv(filepath);
        global.database.query( SqlString.format("INSERT INTO `photos`(`image_url`, `filename`, `user_id`) VALUES (?, ?, ?);", [image_url, image.name, req.user.id]) ).then(function (result) {
            res.status(200).json({ id: result.insertId, image_url });
        }, function (err) {
            fs.unlink(filepath, function (err) { });
            res.status(503).json({ message: "Unknown error" });
        });
    }

    registerRoute (app) {
        app.post(this.route, this.getRoute);
    }

}

module.exports = RouteAddImage;
