const jwt = require("jsonwebtoken"),
bcrypt = require("bcryptjs"),
SqlString = require("sqlstring"),
Route = require("./Route"),
ExpressValidator = require("express-validator");

class RouteLogin extends Route {

    constructor () {
        super("/api/login");
    }

    postRoute (req, res) {
        var dataUser,
        email,
        password;
        if ( !ExpressValidator.validationResult(req).isEmpty() ) {
            res.status(503).json({ message: "Invalid request" });
            return;
        }
        email = req.body.email;
        password = req.body.password;
        global.database.query( SqlString.format("SELECT `id`, `password` FROM `users` WHERE `email` = ?;", [email]) ).then(function (users) {
            if (users.length == 1) {
                dataUser = users[0];
                bcrypt.compare(password, dataUser.password, function(err, result) {
                    if (err)
                        res.status(503).json({ message: "Unknown error" });
                    else if (result)
                        res.status(200).json({
                            id: dataUser.id,
                            token: jwt.sign({ id: dataUser.id }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRES_IN })
                        });
                    else
                        res.status(503).json({ message: "Password incorrect" });
                });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }, function (err) {
            res.status(503).json({ message: "Unknown error" });
        });
    }

    registerRoute (app) {
        app.post(this.route, [
            ExpressValidator.body("email").isEmail().normalizeEmail().isLength({ max: 150 }),
            ExpressValidator.body("password").isString().isLength({ min: 4 })
        ], this.postRoute);
    }

}

module.exports = RouteLogin;
