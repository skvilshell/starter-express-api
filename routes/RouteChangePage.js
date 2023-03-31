const Route = require("./Route");

class RouteChangePage extends Route {

    constructor () {
        super("/api/changepage");
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
        res.status(404).json({ message: "Coming soon" });
    }

    registerRoute (app) {
        app.post(this.route, this.getRoute);
    }

}

module.exports = RouteChangePage;
