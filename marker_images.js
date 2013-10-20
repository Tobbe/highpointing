function MarkerImages() {
    this.icons = new Array();

    this.shadow = new google.maps.MarkerImage('http://maps.google.com/mapfiles/ms/micons/msmarker.shadow.png',
        // The shadow image is larger in the horizontal dimension
        // while the position and offset are the same as for the main image.
        new google.maps.Size(59, 32),
        new google.maps.Point(0,0),
        new google.maps.Point(16, 32));

    this.shape = {
        coord: [19,0, 24,5, 24,12, 23,13, 23,14, 20,17, 20,18, 19,19, 19,20,
                18,21, 18,22, 17,23, 17,26, 16,27, 16,31, 14,31, 14,26, 13,25,
                13,23, 12,22, 12,20, 10,18, 10,17, 7,14, 7,13, 6,12, 6,6, 7,5,
                7,4, 11,0],
        type: 'poly'
    };
}

MarkerImages.prototype.getIcon = function(color, letter) {
    if ((typeof(color) == "undefined") || (color == null)) {
        color = "red";
    }

    if (!this.icons[color + letter]) {
        this.icons[color + letter] = new google.maps.MarkerImage(
            "http://www.google.com/mapfiles/marker_" + color + letter + ".png",
            // This marker is 32 pixels wide by 32 pixels tall.
            new google.maps.Size(32, 32),
            // The origin for this image is 0,0.
            new google.maps.Point(0,0),
            // The anchor for this image is at 16,32.
            new google.maps.Point(16, 32));
    }

    return this.icons[color + letter];
};

MarkerImages.prototype.getIconShadow = function() {
    return this.shadow;
};

MarkerImages.prototype.getIconShape = function() {
    return this.shape;
};
