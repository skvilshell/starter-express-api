const jwt = require("jsonwebtoken"),
bcrypt = require("bcryptjs"),
SqlString = require("sqlstring"),
Route = require("./Route"),
ExpressValidator = require("express-validator");

class RouteRegister extends Route {

    constructor () {
        super("/api/register");
    }

    postRoute (req, res) {
        var name,
        surname,
        phonenumber,
        email,
        password;
        if ( !ExpressValidator.validationResult(req).isEmpty() ) {
            res.status(503).json({ message: "Invalid request" });
            return;
        }
        name = req.body.name;
        surname = req.body.surname;
        phonenumber = req.body.phonenumber;
        email = req.body.email;
        password = req.body.password;
        bcrypt.hash(password, 10, function(err, hashpassword) {
            if (err) {
                res.status(503).json({ message: "Unknown error" });
                return;
            }
            global.database.query( SqlString.format("SELECT `id` FROM `users` WHERE `email` = ?;", [email]) ).then(function (users) {
                if (users.length > 0) {
                    res.status(503).json({ message: "Email already exists" });
                    return;
                }
                global.database.query( SqlString.format("INSERT INTO `users`(`name`, `surname`, `phonenumber`, `email`, `password`) VALUES (?, ?, ?, ?, ?);", [name, surname, phonenumber, email, hashpassword]) ).then(function (result) {
                    res.status(200).json({
                        id: result.insertId,
                        token: jwt.sign({ id: result.insertId }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRES_IN })
                    });
                }, function (err) {
                    res.status(503).json({ message: "Unknown error" });
                });
            }, function (err) {
                res.status(503).json({ message: "Unknown error" });
            });
        });
    }

    registerRoute (app) {
        app.post(this.route, [
            ExpressValidator.body("name").matches(/^[а-яА-ЯЁёa-zA-Z]+$/).isLength({ min: 1, max: 100 }),
            ExpressValidator.body("surname").matches(/^[а-яА-ЯЁёa-zA-Z]+$/).isLength({ min: 1, max: 100 }),
            ExpressValidator.body("phonenumber").matches(/^[0-9]+$/).isLength({ min: 5, max: 100 }),
            ExpressValidator.body("email").isEmail().normalizeEmail().isLength({ max: 150 }),
            ExpressValidator.body("password").isString().notEmpty().isLength({ min: 4 })
        ], this.postRoute);
    }

}

module.exports = RouteRegister;
