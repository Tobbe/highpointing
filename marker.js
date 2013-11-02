function Marker(map, markerImages, latlng, label, color, symbol) {
    var icon;
    if (symbol.length === 1) {
        icon = markerImages.getLetterIcon(color, symbol);
    } else {
        icon = markerImages.getImageIcon(color, symbol);
    }

    this.marker = new google.maps.Marker({
        position: latlng,
        map: map,
        shadow: markerImages.getIconShadow(),
        icon: icon,
        shape: markerImages.getIconShape(),
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
    });
}

Marker.prototype.onClick = function(func) {
    google.maps.event.addListener(this.marker, 'click', func);
};

Marker.prototype.getGoogleMarker = function() {
    return this.marker;
};
