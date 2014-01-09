var exec = require('child_process').exec;
var util = require('util');
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var pathJoin = require('path').join;
var pathDirname = require('path').dirname;
var sysGit = new (require('./lib/sys_git.js'))();

if (process.argv.length < 3) {
    process.stderr.write('Too few arguments. Expected path to repo with pois.geojson');
    process.exit(1);
}

var poisDir = process.argv[2];

async.parallel([
    function(cb) {
        tmp.dir(cb);
    },
    function(cb) {
        sysGit.on('repo_ready', function(pathToRepo) {
            sysGit.on('file_ready', function(pathToFile) {
                cb(null, pathToFile);
            });

            sysGit.getFilePath(pathToRepo, 'master', 'pois.geojson');
        });
    }],

    function(err, results) {
        if (err) throw err;

        var tmpDir = results[0];
        var pathToPois = results[1];

        comparePolylineFiles(tmpDir, pathToPois);
    });

sysGit.copyRepo(pathJoin(poisDir, '.git'));

function comparePolylineFiles(tmpDir, pathToPois) {
    var script = pathJoin(pathDirname(process.argv[1]), 'generate_route_polyline.js');
    var command = 'nodejs ' + script + ' ' + pathJoin(poisDir, 'pois.geojson') + ' ' + tmpDir;

    exec(command, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        // compare with current polyline.json
        var newPolylineFilePath = pathJoin(tmpDir, 'polyline.json');
        var currentPolylineFilePath = pathJoin(poisDir, 'polyline.json');

        async.parallel([
            function(cb) { fs.readFile(currentPolylineFilePath, "utf-8", cb); },
            function(cb) { fs.readFile(newPolylineFilePath, "utf-8", cb); }],

            function(err, results) {
                if (err) throw err;

                if (results[0] == results[1]) {
                    // Files are equal
                    process.exit(0);
                } else {
                    // Files differ
                    process.exit(1);
                }
            });
    });
}
