const Route = require('../Route'),
SqlString = require("sqlstring"),
{ checkSchema, validationResult } = require('express-validator');

class RouteGetCards extends Route {
	constructor () {
        super("/api/cards");
    }

    getRoute(req, res) {
	    if (!validationResult(req).isEmpty())
	    	return res.status(400).json({message: "Bad Request"});

    	const base = "SELECT properties.name, address, district, metro, metro_min, MIN(min_price) AS price, head_photo.image_url AS photo, properties.id FROM properties \
    				  INNER JOIN (SELECT numbers.property_id, MIN(price) AS min_price, GROUP_CONCAT(rental_hour_id) AS hours, GROUP_CONCAT(number_type_id) AS types FROM numbers \
    				  			  INNER JOIN rental_prices ON numbers.id = rental_prices.number_id \
    				  			  INNER JOIN number_types ON numbers.number_type_id = number_types.id \
    				  			  GROUP BY numbers.property_id) min_num ON properties.id = min_num.property_id \
    				  LEFT JOIN (SELECT id, name AS metro FROM metros) m ON m.id = properties.metro_id \
    				  LEFT JOIN (SELECT id, name AS district, city_id FROM districts) d ON d.id = properties.district_id \
    				  LEFT JOIN (SELECT property_id, image_url FROM photos \
    				  			INNER JOIN (SELECT MIN(photo_id) AS photo_id, property_id FROM property_photos GROUP BY property_id) pp \
    				  			ON photos.id = pp.photo_id) head_photo \
    				  ON head_photo.property_id = properties.id \
    				 ";

    	let conditions = [];
    	const validArgs = ['city_id', 'metro_id', 'district_id', 'hours', 'types', 'less', 'more'];
    	for (let column in req.query){
			if (!validArgs.find(el => el === column)) //invalid args
				return res.status(400).json({message: "Bad Request"});
			switch(column) {
				case "more": case "less": //price
					conditions.push( SqlString.escapeId("min_price") + (column === "more" ? ">" : "<") + SqlString.escape(req.query[column]) );
				case "hours": case "types": //rental_hour and rental_type
					conditions.push( " FIND_IN_SET(" + SqlString.escape(req.query[column]) + ", " + SqlString.escapeId(column) + ")" );
				default:
					conditions.push( SqlString.escapeId(column) + "=" + SqlString.escape(req.query[column]) ); 
			}
		}	
		
    	const group = " GROUP BY properties.id, hours;";

    	conditions = conditions.length ? " WHERE " + conditions.join(" AND ") : "";

		global.database.query( SqlString.format(base + conditions + group) )
			.then(function(result){
				if (result)
					res.status(200).json(result);
				else
					res.status(404).json({message: "Not found"});
			}, function (err){
                res.status(503).json({message: "Unknown error"});
        });
    }

    registerRoute (app) {
        app.get(this.route, checkSchema({
        	city_id: {
        		isInt: true,
        		optional: true
        	},
        	metro_id: {
        		isInt: true,
        		optional: true
        	},
        	district_id: {
        		isInt: true,
        		optional: true
        	},
        	types: {
        		isInt: true,
        		optional: true
        	},
        	hours: {
        		isInt: true,
        		optional: true
        	},
        	less: {
        		isInt: true,
        		optional: true
        	}, 
        	more: {
        		isInt: true,
        		optional: true
        	}
        }), (req, res) => this.getRoute(req, res));
    }
}

module.exports = RouteGetCards;