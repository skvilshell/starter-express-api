module.exports = {

    // checkNumbers: function (numbers) {
    //     var number,
    //     dataNumber,
    //     arr = [];
    //     for (let i in numbers) {
    //         dataNumber = numbers[i];
    //         if (typeof dataNumber.name != "string" || typeof dataNumber.type != "number" || typeof dataNumber.images_id != "object" || typeof dataNumber.features != "object" || typeof dataNumber.rental_hours != "object")
    //             continue;
    //         if (dataNumber.name.length > 100 || dataNumber.name.length < 1)
    //             continue;
    //         if ( global.GetNumberType(dataNumber.type) == null )
    //             continue;
    //         number = {};
    //         number.id = null;
    //         number.name = dataNumber.name;
    //         number.type = dataNumber.type;
    //         number.images_id = this.checkIds(dataNumber.images_id);
    //         if (number.images_id.length > 30)
    //             continue;
    //         number.features = this.checkFeatures(dataNumber.features);
    //         number.rental_hours = [];
    //         for (let rental_hour_id of dataNumber.rental_hours) {
    //             if ( global.GetRentalHour(rental_hour_id) == null )
    //                 continue;
    //             number.rental_hours.push(rental_hour_id);
    //         }
    //         arr.push(number);
    //     }
    //     return arr;
    // },

    checkRentalHours: function (rental_hours) {
        var rental_hour,
        arr = [];
        for (let i in rental_hours) {
            rental_hour = rental_hours[i];
            if ( typeof rental_hour.id == "number" && typeof rental_hour.price == "number" && !isNaN(rental_hour.price) && rental_hour.price > 0 && global.GetRentalHour(rental_hour.id) != null )
                arr.push(rental_hour);
        }
        return arr;
    },

    checkFeatures: function (features) {
        var feature,
        arr = [];
        for (let i in features) {
            feature = features[i];
            if ( typeof feature.id == "number" && typeof feature.description == "string" && feature.description.length < 101 && feature.description.trim().length > 0 && global.GetNumberFeature(feature.id) != null )
                arr.push(feature);
        }
        return arr;
    },

    checkServices: function (services) {
        var service,
        arr = [];
        for (let i in services) {
            service = services[i];
            if ( typeof service.id == "number" && typeof service.description == "string" && service.description.length <= 100 && service.description.trim().length >= 1 && global.GetPropertyService(service.id) != null )
                arr.push(service);
        }
        return arr;
    },

    checkIds: function (images_id) {
        var image_id,
        arr = [];
        for (let i in images_id) {
            image_id = images_id[i];
            if ( typeof image_id == "number" && !isNaN(image_id) && image_id > 0 && image_id.toString().length < 11 )
                arr.push(image_id);
        }
        return arr;
    },

    getMysqlTime: function (now) {
        var date;
        if (now != null)
            date = new Date(now);
        else
            date = new Date();
        return date.toISOString().slice(0, 19).replace("T", " ");
    }

};
