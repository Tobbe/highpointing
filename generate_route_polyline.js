var routeCreator = new (require('./lib/route_creator.js'))();

if (process.argv.length < 4) {
    throw "Too few arguments. Two expected, but got " + (process.argv.length - 2);
}

var poiFile = process.argv[2];
var outputDir = process.argv[3];

var intervalID = 0;

routeCreator.on('route_written', function(file) {
    clearInterval(intervalID);
    process.stdout.write('\n');
    console.log("File written, " + file);
    process.exit(0);
});

process.stdout.write('Calculating the route');
intervalID = setInterval(function () { process.stdout.write('.'); }, 500);
routeCreator.createRoute(poiFile, outputDir);
