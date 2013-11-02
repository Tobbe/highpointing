function Itinerary() {
    this.itinerary = [];
    this.onLoadCompleteFunction = function() {};
}

Itinerary.prototype.loadJSON = function(jsonPath) {
    $.getJSON(jsonPath, function(data) {
        this.itinerary = data;
        this.onLoadCompleteFunction(this);
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

Itinerary.prototype.forEach = function(fn) {
    this.itinerary.forEach(function (item) {
        fn(item);
    });
};
