const jwt = require("jsonwebtoken"),
Route = require("./Route"),
User = require("../User");

class RouteAuth extends Route {

    constructor () {
        super(null);
    }

    getRoute (req, res, next) {
        if (req.headers.authorization || req.body.token) {
            jwt.verify(
                req.body.token || req.headers.authorization.split(" ")[1],
                process.env.SECRET_KEY,
                function (err, payload) {
                    if (err || !payload)
                        next();
                    else
                        global.database.query("SELECT `id`, `name`, `phonenumber`, `email`, `is_email_confirmed`, `role_id`, `logout_at`, `joined_at`, `last_seen_at` FROM `users` WHERE `id` = '" + payload.id + "';").then(function (users) {
                            if (users.length == 1)
                                req.user = new User(users[0].id).import(users[0]);
                            next();
                        }, function (err) {
                            next();
                        });
                }
            )
        } else {
            next();
        }
    }

    registerRoute (app) {
        app.use(this.getRoute);
    }

}

module.exports = RouteAuth;
