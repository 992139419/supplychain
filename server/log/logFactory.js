/**
 * Created by tangnian on 14-4-11.
 */
var log4js = require('log4js');
log4js.configure(process.cwd()+'/log4js_configuration.json', {});
var fs = require('fs');
var logdir = process.cwd();
var info = fs.createWriteStream(logdir + '/info.log', {flags: 'a', mode: '0666'});
var error = fs.createWriteStream(logdir + '/error.log', {flags: 'a', mode: '0666'});
var logger = new console.Console(info, error);
var custmoLogger = {};
custmoLogger.info = function () {
    var args = Array.prototype.slice.call(arguments);
    var content = args.join(' ');
    logger.info(new Date().toString() + ":" + content);
}
custmoLogger.error = function () {
    var args = Array.prototype.slice.call(arguments);
    var content = args.join(' ');
    logger.error(new Date().toString() + ":" + content);
}

exports.getLogger = function () {
    return custmoLogger;
}
