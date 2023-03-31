const Route = require("./Route");

class RouteUser extends Route {

    constructor () {
        super("/api/user");
    }

    getRoute (req, res) {
        if (req.user)
            res.status(200).json({ response: [req.user.export(["id", "name", "phonenumber", "email", "role_id"])] });
        else
            res.status(401).json({ message: "Unauthorized access" });
    }

    registerRoute (app) {
        app.get(this.route, this.getRoute);
    }

}

module.exports = RouteUser;
