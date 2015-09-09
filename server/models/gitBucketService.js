var logger = require('../log/logFactory').getLogger();
var exec = require('child_process').exec;

exports.gitHook = function (req, res) {
    var data = req.body.payload;
    if (!data) {
        res.json({"status": 0});
    }
    data = JSON.parse(data);
    var commits = data.commits[0];
    if (commits) {
        var files = commits.files;
        var author = commits.author;
        var timestamp = commits.timestamp;
        var branch = commits.branch;
        var message = commits.message;
        //是主分支，同时提交的信息中包含publish字样
        if (branch == "master" && message.indexOf("publish") > -1) {
            pullProject(author);
            res.json({"status": 1});
        } else {
            res.json({"status": 2});
        }
    } else {
        res.json({"status": 0});
    }
}

exports.manuallyPull = function (req, res) {
    pullProject('Slimeria-manually', res);
}

function pullProject(author, res) {
    exec('chmod u+x ' + process.cwd() + '/gitHook.sh', function (err, stdout, stderr) {
        //console.info("err:"+err);
        //console.info("stdout:"+stdout);
        //console.info("stderr:"+stderr);
        if (!err) {
            exec(process.cwd() + '/gitHook.sh', function (err, stdout, stderr) {
                if (err) {
                    console.info(stdout);
                    console.info('pull meet a failed err.');
                    console.info(err);
                    //mailService.sendDeploymentMail(author, err);
                } else {
                    console.info(stdout);
                    console.info('pull success');
                    exec('forever restart ' + process.cwd() + '/index.js', function (err, stdout, stderr) {
                    });
                    //mailService.sendDeploymentMail(author);
                }
                if (res) {
                    exec('forever restart ' + process.cwd() + '/index.js', function (err, stdout, stderr) {
                    });
                    res.json({"response": stdout, "status": "restart....please wait."});
                }
            });
        }
    });
}
