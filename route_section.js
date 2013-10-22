function RouteSection(directionsService, pointsToVisit, routeCompletedCallback) {
    this.start = pointsToVisit[0].location;
    this.end = pointsToVisit[pointsToVisit.length - 1].location;
    this.vias = pointsToVisit.slice(1, -1);
    this.routeResult = {};
	this.routes = [];
    this.routeCompletedCallback = routeCompletedCallback;

    var request = {
        origin: this.start,
        waypoints: this.vias,
        destination: this.end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            this.routeResult = result;
            var route = result.routes[0];
            if (route.legs.length != this.vias.length + 1) {
                alert("Yor code is broken. " + this.vias.length + " legs expected. Got " + route.legs.length);
                return;
            }
 
            for (var leg = 0; leg < route.legs.length; leg++) {
                this.routes.push(route.legs[leg]);
            }

            this.routeCompletedCallback(this);
        } else {
            alert(status);
        }
    }.bind(this));
}

RouteSection.prototype.getDirectionsResult = function() {
    return this.routeResult;
};

RouteSection.prototype.getStart = function() {
    return this.start;
};
