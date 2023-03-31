const Route = require('../Route'),
SqlString = require("sqlstring"),
{ checkSchema, validationResult } = require('express-validator');

class RouteGetPlace extends Route {
	constructor () {
        super("/api/place");
    }

    getRoute(req, res){
        if (!validationResult(req).isEmpty())
            return res.status(400).json({message: "Bad Request"});
        
        global.database.query(SqlString.format("SELECT properties.name, phonenumber, hotel_photos, description, comment_data, nums_data FROM properties \
                                                INNER JOIN (SELECT id, phonenumber FROM users) user \
                                                ON user.id = properties.user_id \
                                                LEFT JOIN ( SELECT property_id, JSON_ARRAYAGG(image_url) AS hotel_photos FROM property_photos \
                                                            INNER JOIN photos ON photos.id = property_photos.photo_id \
                                                            GROUP BY property_id) pp \
                                                ON pp.property_id = properties.id \
                                                LEFT JOIN ( SELECT property_id, JSON_OBJECTAGG(user_name, \
                                                                                    JSON_OBJECT('like', text_like, \
                                                                                                'dislike', text_dislike, \
                                                                                                'rate', rate) \
                                                                                ) AS comment_data \
                                                            FROM comments \
                                                            INNER JOIN (SELECT id, CONCAT(name, surname) AS user_name FROM users) user \
                                                            ON user.id = comments.user_id \
                                                            GROUP BY property_id) comment \
                                                ON comment.property_id = properties.id \
                                                INNER JOIN (SELECT property_id, JSON_OBJECTAGG(numbers.id, \
                                                                                    JSON_OBJECT('type', number_types.name, \
                                                                                                'price', price,\
                                                                                                'hours', hours,\
                                                                                                'features', features) \
                                                                                ) AS nums_data \
                                                            FROM numbers \
                                                            INNER JOIN number_types ON number_types.id = numbers.number_type_id \
                                                            LEFT JOIN (SELECT number_id, GROUP_CONCAT(description) AS features FROM feature_number GROUP BY number_id) fn \
                                                            ON fn.number_id = numbers.id \
                                                            INNER JOIN (SELECT number_id, MIN(price) AS price, GROUP_CONCAT(rental_hours.name) AS hours FROM rental_prices \
                                                                        INNER JOIN rental_hours ON rental_hours.id = rental_prices.rental_hour_id \
                                                                        GROUP BY number_id) rp \
                                                            ON  rp.number_id = numbers.id \
                                                            GROUP BY property_id) nums \
                                                ON nums.property_id = properties.id \
                                                WHERE properties.id = ? \
                                                GROUP BY properties.id", [req.query.id]))
            .then(
                function(result){
                    if (result)
                        res.status(200).json(result);
                    else
                        res.status(404).json({message: "Not found"});
                }, 
                function (err){
                    res.status(503).json({message: "Unknown error"});
            });
    }

    registerRoute (app) {
        app.get(this.route, checkSchema({
            id: {
                isInt: true
            }
        }), this.getRoute);
    }
}

module.exports = RouteGetPlace;