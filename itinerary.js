function Itinerary() {
    this.itinerary = [];
    this.onLoadCompleteFunction = function() {};
    Object.defineProperty(this, "length", {
        get: function() { return this.itinerary.length; },
    });
}

Itinerary.prototype.loadJSON = function(jsonPath) {
    $.getJSON(jsonPath, function(data) {
        this.itinerary = data;
        this.onLoadCompleteFunction();
    }.bind(this)).fail(function(jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
    });
};

Itinerary.prototype.addPointsToItinerary = function(pois) {
    this.itinerary.forEach(function (item) {
        var storePoints = false;
        var pointsVisited = [];

        for (var i = 0; i < pois.length; ++i) {
            if (pois[i].id == item.from || pois[i].name == item.from) {
                storePoints = true;
            }

            if (storePoints) {
                pointsVisited.push(pois[i]);
            }

            if (pois[i].id == item.to || pois[i].name == item.to) {
                break;
            }
        }

        item.pointsVisited = pointsVisited;
    });
};

Itinerary.prototype.onLoadComplete = function(func) {
    this.onLoadCompleteFunction = func;
};

/**
 * Special forEach implementation where you can stop the iteration by
 * returning false from the callback function
 */
Itinerary.prototype.forEach = function(fn) {
    for (var i = 0; i < this.itinerary.length; ++i) {
        if (fn(this.itinerary[i], i) === false) {
            break;
        }
    }
};
