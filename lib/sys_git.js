var exec = require('child_process').exec;
var util = require('util');
var tmp = require('tmp');
var events = require('events');
var ncp = require('ncp').ncp;
var pathJoin = require('path').join;
var async = require('async');

var SysGit;

module.exports = exports = SysGit = function() {};

util.inherits(SysGit, events.EventEmitter);

SysGit.prototype.copyRepo = function(repoPath) {
    var tmpDir;
    var cwd = process.cwd();

    async.waterfall([
        function(cb) {
            tmp.dir(function(err, tempDir) {
                tmpDir = tempDir;
                cb(err);
            });
        },
        function(cb) {
            ncp(repoPath, pathJoin(tmpDir, '.git'), cb);
        },
        function(cb) {
            process.chdir(tmpDir);
            exec("git fetch --all", cb);
        },
        function(stdout, stderr, cb) {
            exec("git branch --list", cb);
        },
        function(output, stderr, cb) {
            parseBranchNames(output, cb);
        },
        function(branches, cb) {
            async.eachSeries(branches, checkoutAndReset, cb);
        }
    ], function(err, result) {
        process.chdir(cwd);

        if (err) throw err;

        this.emit('repo_ready', tmpDir);
    }.bind(this));

    function parseBranchNames(output, cb) {
        var branches = [];
        output.split('\n').forEach(function(branch) {
            if (branch.length === 0) return;
            branch = branch.replace(/^(\s|\*)+/,'');
            branches.push(branch);
        });

        cb(null, branches);
    }

    function checkoutAndReset(branch, cb) {
        async.series([
            function(cb) { exec("git checkout " + branch, cb); },
            function(cb) { exec("git reset --hard origin/" + branch, cb); }
        ], cb);
    }
};

SysGit.prototype.getFilePath = function(repo, branch, file) {
    cwd = process.cwd();
    process.chdir(repo);
    exec("git reset --hard " + branch, function(err, stdout, stderr) {
        process.chdir(cwd);
        this.emit("file_ready", pathJoin(repo, file));
    }.bind(this));
};

SysGit.prototype.commit = function(repo, branch, file, msg) {
    process.chdir(repo);
    async.series([
        function(cb) { exec("git checkout " + branch, cb); },
        function(cb) { exec("git add " + file, cb); },
        function(cb) { exec("git commit -m \"" + msg + "\"", cb); },
        function(cb) { exec("git push", cb); },
        function(cb) { process.chdir(repo); cb(null); }
    ]);
};
