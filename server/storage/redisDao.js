/**
 * Created by tangnian on 14-4-7.
 */
var config = require('../../config');

var redis = require("redis");
var client7891 = redis.createClient(config.redisport, config.redishost);
//var client7892 = redis.createClient(config.redisport, config.redishost);
//var client7894 = redis.createClient('7894', '10.160.17.20');
//var client7895 = redis.createClient('7895', '10.160.17.20');

exports.getInstance = function () {
    return client7891;
};

exports.print = redis.print;

//exports.client7892 = function () {
//    return client7892;
//};

//异常处理
client7891.on("error", function (err) {
    console.log("Error :" + err);
});

//client7892.on("error", function (err) {
//    console.log("Error :" + err);
//});
