define(['config', 'service/popup', 'service/api'], function (config, popup, api) {
    'use strict';

    var radius = 6371000;

    var degToRad = function (degrees)
    {
        return degrees * 0.0174532925;
    };

    var myPosition = {coords: {latitude: 59.429773, longitude: 24.759520}};
    var myPlace = {'country': '', 'city': ''};
    var geoMobile = false;

    var calculateDistance = function (pointA, pointB)
    {
        //http://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates    

        var lat1 = degToRad(pointA.latitude);
        var lat2 = degToRad(pointB.latitude);

        var lon1 = degToRad(pointA.longitude);
        var lon2 = degToRad(pointB.longitude);

        var latDif = degToRad(Math.abs(pointA.latitude - pointB.latitude));
        var lonDif = degToRad(Math.abs(pointA.longitude - pointB.longitude));

        var a = Math.pow(Math.sin(latDif / 2), 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(lonDif / 2), 2);

        var angle = 2 * Math.atan2(
                Math.sqrt(a), Math.sqrt(1 - a)
                );
        var distance = angle * radius;

        return distance;
    };

    var getDistanceFromMe = function (locations) {

        var me = {latitude: myPosition.coords.latitude, longitude: myPosition.coords.longitude};

        var place = {distance: Number.MAX_VALUE, location: {}};
        if (locations)
            for (var i = 0; i < locations.length; i++)
            {
                if (!locations[i].geometry)
                    continue;

                var point = {latitude: locations[i].geometry.lat, longitude: locations[i].geometry.lng};
                var currentDist = calculateDistance(point, me);

                if (currentDist < place.distance)
                {
                    place.distance = currentDist;
                    place.location = locations[i];
                }
            }

        //Tallin's center
        if (place.distance == Number.MAX_VALUE)
            place.distance = calculateDistance({latitude: '59.429773', longitude: '24.759520'}, me)

        return place;
    };

    var buildMap = function (elem, locations)
    {
        if (!locations)
            return;

        var center = {lat: 0, lng: 0};

        var counter = 0;
        for (var i = 0; i < locations.length; i++)
        {
            if (!locations[i] && locations[i].geometry)
                continue;

            center.lat += locations[i].geometry.lat;
            center.lng += locations[i].geometry.lng;
            counter++;
        }

        if (counter)
        {
            center.lat /= counter;
            center.lng /= counter;
        }
        else
            center = {lat: myPosition.coords.latitude, lng: myPosition.coords.longitude};




        var map = new google.maps.Map(elem, {
            center: center,
            zoom: 12,
            disableDefaultUI: true
        });

        var infoWindow = new google.maps.InfoWindow();

        for (var i = 0; i < locations.length; i++)
        {
            var marker = new google.maps.Marker({
                map: map,
                position: {lat: locations[i].geometry.lat, lng: locations[i].geometry.lng},
                //thank you Google for this bug with info windows
                infoContent: locations[i].shortName
            });

            marker.addListener('click', function () {
                infoWindow.setContent(this.infoContent);
                infoWindow.open(map, this);
            });
        }
    }

    var startWatch = function () {
        api.getMyGeometry(function (gmt) {

            if (geoMobile)
                return;

            myPosition.coords.latitude = gmt.lat,
            myPosition.coords.longitude = gmt.lng;
            myPlace.country = gmt.country;
            myPlace.city = gmt.city;
        });


        watchId = navigator.geolocation.watchPosition(function (success) {
            myPosition = success;
            geoMobile = true;
        }, function (error) {

            console.log('can`t get geolocation', error);

            //if (gmt.lat == 0 && gmt.lng == 0) {
            popup.show(popup.popups.geolocationError);

//                return;
            //          }


        }, {timeout: 30000, enableHighAccuracy: true});
    };

    var watchId;

    var stopWatch = function () {
        if (config.mobile)
            navigator.geolocation.clearWatch(watchId);
    };

    return {
        getDistanceFromMe: getDistanceFromMe,
        init: function () {
            startWatch();
        },
        stop: function () {
            stopWatch();
        },
        buildMap: buildMap,
        getMyPlace: function () {
            return myPlace;
        }
    };
});


