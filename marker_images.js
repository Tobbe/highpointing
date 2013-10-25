function MarkerImages() {
    this.icons = [];

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

/**
 * Create a pin icon with the supplied letter on it
 *
 * Standard Google pin colors:
 * Red: FF766A (http://maps.google.com/mapfiles/markerA.png)
 * Green: 65BA4A (http://maps.google.com/mapfiles/marker_greenA.png)
 * Purple: 9079FC (http://maps.google.com/mapfiles/marker_purpleA.png)
 * Orange: FFB100 (http://maps.google.com/mapfiles/marker_orangeA.png)
 * White: FFFFFF (http://maps.google.com/mapfiles/marker_whiteA.png)
 * Brown: B68800 (http://maps.google.com/mapfiles/marker_brownA.png)
 * Grey: BCBCBC (http://maps.google.com/mapfiles/marker_greyA.png)
 * Yellow: FCF357 (http://maps.google.com/mapfiles/marker_yellowA.png)
 * Light yellow: EFE387 (http://maps.google.com/mapfiles/marker_yellow.png)
 */
MarkerImages.prototype.getLetterIcon = function(color, letter) {
    if (!this.icons[color + letter]) {
        var url = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=' + letter + '|' + color + '|000000';
        this.icons[color + letter] = this._getIcon(url);
    }

    return this.icons[color + letter];
};

MarkerImages.prototype.getImageIcon = function(color, image) {
    if (!this.icons[color + image]) {
        var url = 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=' + image + '|' + color;
        this.icons[color + image] = this._getIcon(url);
    }

    return this.icons[color + image];
};

MarkerImages.prototype._getIcon = function(url) {
    return new google.maps.MarkerImage(
        url,
        // This marker is 32 pixels wide by 32 pixels tall.
        new google.maps.Size(32, 32),
        // The origin for this image is 0,0.
        new google.maps.Point(0,0),
        // The anchor for this image is at 16,32.
        new google.maps.Point(16, 32));
};

MarkerImages.prototype.getIconShadow = function() {
    return this.shadow;
};

MarkerImages.prototype.getIconShape = function() {
    return this.shape;
};
