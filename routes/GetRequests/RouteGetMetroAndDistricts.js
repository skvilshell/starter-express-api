const Route = require('../Route'),
SqlString = require("sqlstring"),
{ checkSchema, validationResult } = require('express-validator');

class RouteGetPlace extends Route {
	constructor () {
        super("/api/zone");
    }

    getRoute(req, res){
        if (!validationResult(req).isEmpty())
            return res.status(400).json({ message: "Bad Request" });
        
        global.database.query(SqlString.format("SELECT metros.id, metros.name AS metro FROM metros \
                                                WHERE city_id = ?;\
                                                SELECT districts.id, districts.name AS district FROM districts \
                                                WHERE city_id = ?;", [req.query.id, req.query.id]))
            .then(
                function(data){
                    if (data){
                        res.status(200).json({metro: data[0], districts: data[1]});
                    }
                    else
                        res.status(404).json({message: "Not found"});
                }, 
                function (err){
                    res.status(503).json({message: "Unknown error"});
            });
    }

    registerRoute (app){
        app.get(this.route, checkSchema({
            id: {
                isInt: true
            }
        }), this.getRoute);
    }
}

module.exports = RouteGetPlace;