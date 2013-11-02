function Route(directionsService, pois) {
    this.completedRouteSections = 0;
    this.pois = pois;
    this.poiChunks = devideIntoChunks.call(this, pois);
    this.routeSections = createSections.call(this,
                                             directionsService,
                                             this.poiChunks);

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

    function createSections(directionsService, poiChunks) {
        var sections = [];

        poiChunks.forEach(function (chunk) {
            var waypoints = chunk.map(function (poi) {
                return {
                    location: poi.routable_location || poi.location,
                    stopover: true
                };
            });

            sections.push(new RouteSection(directionsService,
                                           waypoints,
                                           this.routeCompletedForSection.bind(this)));
        }.bind(this));

        return sections;
    }
}

Route.prototype.onRouteCompleted = function (callback) {
    this.fullRouteCompleted = callback;
};

Route.prototype.routeCompletedForSection = function(routeSection) {
    this.completedRouteSections++;

    var startOfSection = routeSection.getStart();

    for (var i = 0; i < this.poiChunks.length; i++) {
    }

    if (this.routeSections && 
            this.completedRouteSections == this.routeSections.length) {

        updatePoiDistances.call(this);
        this.fullRouteCompleted(combineResults.call(this));
    }

    function combineResults() {
        var directionsResult = {};
        directionsResult.status = "OK";
        directionsResult.Wb = this.routeSections[0].getDirectionsResult().Wb; // NOT future proof. Not part of spec
        directionsResult.routes = new Array(1);
        directionsResult.routes[0] = {};
        var route = directionsResult.routes[0];
        route.legs = this.routeSections[0].getDirectionsResult().routes[0].legs;
        route.waypoint_order = this.routeSections[0].getDirectionsResult().routes[0].waypoint_order;
        route.overview_path = this.routeSections[0].getDirectionsResult().routes[0].overview_path;
        route.bounds = this.routeSections[0].getDirectionsResult().routes[0].bounds; // Should probably be updated as well
        route.copyrights = this.routeSections[0].getDirectionsResult().routes[0].copyrights;
        route.warnings = this.routeSections[0].getDirectionsResult().routes[0].warnings;

        for (var i = 1; i < this.routeSections.length; ++i) {
            var resultRoute = this.routeSections[i].getDirectionsResult().routes[0];
            route.legs = route.legs.concat(resultRoute.legs);
            route.overview_path = route.overview_path.concat(resultRoute.overview_path);

            for (var j = 0; j < route.legs.length - 1; ++j) {
                route.waypoint_order.push(route.waypoint_order.length + j);
            }
        }

        return directionsResult;
    }

    function updatePoiDistances() {
        this.poiChunks.forEach(function (chunk, chunkIndex) {
            for (var i = 0; i < this.routeSections.length; ++i) {
                var sect = this.routeSections[i];

                if (this.routeSections[i].getStart() == 
                    (chunk[0].routable_location || chunk[0].location)) {
                    // Got the matching chunk and RouteSection
                    
                    if (chunkIndex === 0) {
                        chunk[0].distanceFromStart = 0;
                    } else {
                        chunk[0].distanceFromStart = this.poiChunks[chunkIndex - 1][this.poiChunks[chunkIndex - 1].length - 1].distanceFromStart;
                    }

                    for (var j = 1; j < chunk.length; ++j) {
                        var poi = chunk[j];

                        poi.distanceFromStart =
                            chunk[j - 1].distanceFromStart +
                            sect.routes[j - 1].distance.value;
                    }
                }
            }
        }.bind(this));

        for (var i = 0; i < this.poiChunks.length; ++i) {
            for (var j = 0; j < this.poiChunks[i].length; ++j) {
                var itemsPerChunk = this.poiChunks[0].length - 1;
                this.pois[i * itemsPerChunk + j].distanceFromStart = 
                    this.poiChunks[i][j].distanceFromStart;
            }
        }
    }
};
