function Markers(infowindow, markerImages) {
    this.infowindow = infowindow;
    this.markerImages = markerImages;
    this.markers = [];
}

Markers.prototype.createMarker = function (map, latlng, label, html, color, symbol) {
    var marker = new Marker(map, this.markerImages, latlng, label, color, symbol);
    marker.onClick(function(infoWnd) {
        var infowindow = infoWnd;
        return function() {
            var contentString = '<div class="noscrollbar_infowindow">' +
                                    '<b>'+label+'</b><br>'+html+
                                '</div>';
            infowindow.setContent(contentString);
            infowindow.open(map, marker.getGoogleMarker());
        };
    }(this.infowindow));

    this.markers.push(marker);
};
