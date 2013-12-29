var git = require('git-node');
var tmp = require('tmp');
var util = require('util');
var fs = require('fs');
var events = require('events');
var pathJoin = require('path').join;

var GitFileDownloader;

module.exports = exports = GitFileDownloader = function() {};

util.inherits(GitFileDownloader, events.EventEmitter);

GitFileDownloader.prototype.getFile = function(file, url) {
    var self = this;

    tmp.dir(function(err, path) {
        if (err) throw err;

        var remote = git.remote(url);
        var repo = git.repo(path);

        console.log("Cloning %s to %s", url, path);

        var opts = {};

        repo.fetch(remote, opts, function (err) {
            if (err) throw err;

            repo.loadAs("commit", "HEAD", onCommit);

            function onCommit(err, commit, hash) {
                if (err) throw err;
                repo.loadAs("tree", commit.tree, onTree);
            }

            function onTree(err, tree, hash) {
                if (err) throw err;
                for (var i = 0; i < tree.length; ++i) {
                    if (tree[i].name === file) {
                        onEntry(tree[i]);
                        break;
                    }
                }
            }

            function onEntry(entry) {
                repo.loadAs("blob", entry.hash, function (err, blob) {
                    if (err) throw err;
                    var fullPath = pathJoin(path, entry.name);
                    fs.writeFile(fullPath, blob, function(err) {onDone(err, fullPath);});
                });
            }
        });
    });

    function onDone(err, path) {
        if (err) throw err;

        self.emit('file_downloaded', path);
    }
};
