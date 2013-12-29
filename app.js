var rc = require('./route_creator.js');
var routeCreator = new rc();

var gfd = require('./git_file_downloader.js');
var gitFileDownloader = new gfd();

gitFileDownloader.on('file_downloaded', function(path) {
    routeCreator.createRoute(path);
});

routeCreator.on('route_written', function(file) {
    // commit polyline.json to gh-pages branch
    console.log('route written');
});

var url = "https://github.com/Tobbe/highpointing.git";
gitFileDownloader.getFile("pois.geojson", url);
