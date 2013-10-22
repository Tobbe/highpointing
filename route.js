function Route(directionsService, highpoints) {
    this.completedRouteSections = 0;
    this.highpoints = highpoints;
    this.highpointChunks = devideIntoChunks.call(this, highpoints);
    this.routeSections = createSections.call(this,
                                             directionsService,
                                             this.highpointChunks);

    /**
     * Let's say these are the highpoints:
     *    A B C D E F G H I J K L M N O P Q R S
     *
     * Then we split them in to chunks like this (if each chunk is only
     * allowed to have six highpoints):
     *    A B C D E F
     *              F G H I J K
     *                        K L M N O P
     *                                  P Q R S
     *
     * The reason we have to devide the highpoints into chunks like this is
     * because of Google's limitations on free accounts.
     */
    function devideIntoChunks(highpoints) {
        var HIGHPOINTS_PER_CHUNK = 10;
        var chunks = [];
        var chunkStartIndex = 0; // At what highpoint this chunk should start
 
        while (chunkStartIndex < highpoints.length - 1) {
            var highpointsSlice = highpoints.slice(chunkStartIndex,
                                                   chunkStartIndex + HIGHPOINTS_PER_CHUNK);
            chunks.push(highpointsSlice);

            chunkStartIndex += (HIGHPOINTS_PER_CHUNK - 1);
        }

        return chunks;
    }

    function createSections(directionsService, highpointChunks) {
        var sections = [];

        highpointChunks.forEach(function (chunk) {
            var waypoints = chunk.map(function (highpoint) {
                return {
                    location: highpoint.routable_location || highpoint.location,
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

    for (var i = 0; i < this.highpointChunks.length; i++) {
    }

    if (this.routeSections && 
            this.completedRouteSections == this.routeSections.length) {

        updateHighpointDistances.call(this);
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

    function updateHighpointDistances() {
        this.highpointChunks.forEach(function (chunk, chunkIndex) {
            for (var i = 0; i < this.routeSections.length; ++i) {
                var sect = this.routeSections[i];

                if (this.routeSections[i].getStart() == 
                    (chunk[0].routable_location || chunk[0].location)) {
                    // Got the matching chunk and RouteSection
                    
                    if (chunkIndex === 0) {
                        chunk[0].distanceFromStart = 0;
                    } else {
                        chunk[0].distanceFromStart = this.highpointChunks[chunkIndex - 1][this.highpointChunks[chunkIndex - 1].length - 1].distanceFromStart;
                    }

                    for (var j = 1; j < chunk.length; ++j) {
                        var highpoint = chunk[j];

                        highpoint.distanceFromStart =
                            chunk[j - 1].distanceFromStart +
                            sect.routes[j - 1].distance.value;
                    }
                }
            }
        }.bind(this));

        for (var i = 0; i < this.highpointChunks.length; ++i) {
            for (var j = 0; j < this.highpointChunks[i].length; ++j) {
                var itemsPerChunk = this.highpointChunks[0].length - 1;
                this.highpoints[i * itemsPerChunk + j].distanceFromStart = 
                    this.highpointChunks[i][j].distanceFromStart;
            }
        }
    }
};
