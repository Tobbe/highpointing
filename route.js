function Route(directionsService, itinerary) {
    this.completedRouteSections = 0;
    this.itinerary = itinerary;
    this.poiChunks = devideIntoChunks.call(this, itinerary);
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
    function devideIntoChunks(itinerary) {
        var chunks = [];

        itinerary.forEach(function (day) {
            chunks.push(day.pointsVisited);
        });

        return chunks;
    }

    function createSections(directionsService, poiChunks) {
        var sections = [];

        // TODO: clean this up
        for (var i = 0; i < poiChunks.length; ++i) {
            var chunk = poiChunks[i];
            setTimeout((function (chnk) {
                return function() {
                    pushSection.call(this, chnk);
                }.bind(this);
            }).call(this, chunk), 700 * i);
        }

        return sections;

        function pushSection(chunk) {
            var waypoints = chunk.map(function (poi) {
                return {
                    location: poi.routable_location || poi.location,
                    stopover: true
                };
            });

            sections.push(new RouteSection(directionsService,
                                           waypoints,
                                           this.routeCompletedForSection.bind(this)));
        }
    }
}

Route.prototype.onRouteCompleted = function (callback) {
    this.fullRouteCompleted = callback;
};

Route.prototype.routeCompletedForSection = function(routeSection) {
    this.completedRouteSections++;

    var startOfSection = routeSection.getStart();

    if (this.routeSections && 
            this.completedRouteSections == this.poiChunks.length) {

        updatePoiDistances.call(this);
        this.fullRouteCompleted(this.routeSections);
    }

    function updatePoiDistances() {
        var routeSectionStartIndex = 0;
        this.poiChunks.forEach(function (chunk, chunkIndex) {
            for (var i = routeSectionStartIndex; i < this.routeSections.length; ++i) {
                var sect = this.routeSections[i];

                if (this.routeSections[i].getStart() == 
                    (chunk[0].routable_location || chunk[0].location)) {
                    // Got the matching chunk and RouteSection
                    
                    routeSectionStartIndex = i + 1;

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

                    break;
                }
            }
        }.bind(this));
    }
};
