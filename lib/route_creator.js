var gm = require('googlemaps');
var util = require('util');
var fs = require('fs');
var events = require('events');
var RouteCreator;

module.exports = exports = RouteCreator = function() {};

util.inherits(RouteCreator, events.EventEmitter);

RouteCreator.prototype.createRoute = function(inputFile, outputDir) {
    var self = this;

    fs.readFile(inputFile, 'utf8', function (err, geojson) {
        if (err) throw err;
 
        geojson = JSON.parse(geojson);

        var waypoints = extractWaypoints(geojson);
        var waypointChunks = devideIntoChunks(waypoints);
        var routeInfo = new Array(waypointChunks.length);

        waypointChunks.forEach(function (chunk, index) {
            var uri = gm.directions(chunk[0], chunk[chunk.length - 1], function(err, result) {
                if (err) throw err;

                result.routes[0].legs.forEach(function(leg) {
                    delete leg.duration;
                    delete leg.end_address;
                    delete leg.end_location;
                    delete leg.start_address;
                    delete leg.start_location;
                    delete leg.via_waypoint;

                    var legPolyline = [];
                    var p = 0;

                    leg.steps.forEach(function(step) {
                        legPolyline.push(step.polyline.points);
                    });

                    leg.polyline = legPolyline;
                    leg.distance = leg.distance.value / 1000;

                    delete leg.steps;
                });

                routeInfo[index] = result.routes[0].legs;
                if (arrayIsFull(routeInfo)) {
                    var combined = [];
                    for (var i = 0; i < routeInfo.length; ++i) {
                        combined = combined.concat(routeInfo[i]);
                    }
                    writeToFile(combined);
                }
            }, 'false', 'driving', chunk.slice(1, -1).join('|'));
        });
    });

    function writeToFile(routeInforation) {
        var polylineFile = outputDir + '/polyline.json';
        fs.writeFile(polylineFile, JSON.stringify(routeInforation), function(err) {
            if (err) throw err;

            self.emit('route_written', polylineFile);
        });
    }
};

function extractWaypoints(geojson) {
    var waypoints = [];

    geojson.features.forEach(function (feature) {
        var location = feature.geometry.coordinates[1] + ',' +
                       feature.geometry.coordinates[0];
        var routable_location = feature.properties.routable_location;

        waypoints.push(routable_location || location);
    });

    return waypoints;
}

function arrayIsFull(arr) {
    var l = arr.length - 1;
    while (l >= 0) {
        if (typeof arr[l] == 'undefined' || arr[l] === null) {
            return false;
        }
        --l;
    }
    return true;
}

/**
 * Let's say these are the Points of Interest (pois):
 *    A B C D E F G H I J K L M N O P Q R S
 *
 * Then we split them in to chunks like this (if each chunk is only
 * allowed to have six pois):
 *    A B C D E F
 *              F G H I J K
 *                        K L M N O P
 *                                  P Q R S
 *
 * The reason we have to devide the pois into chunks like this is
 * because of Google's limitations on free accounts.
 */
function devideIntoChunks(pois) {
    var POIS_PER_CHUNK = 10;
    var chunks = [];
    var chunkStartIndex = 0; // At what poi this chunk should start

    while (chunkStartIndex < pois.length - 1) {
        var poisSlice = pois.slice(chunkStartIndex,
                                   chunkStartIndex + POIS_PER_CHUNK);
        chunks.push(poisSlice);

        chunkStartIndex += (POIS_PER_CHUNK - 1);
    }

    return chunks;
}

