var config = require('../../config');
var mongodaDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var underscore = require('underscore');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var userPromise = require('./userService').userPromise;
var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID
var url = require('url');
var urlencode = require('urlencode');
var request = require('request');
var Q = require('q');

/**
 * 百度地图通过地址获取经纬度信息接口
 * @param address
 * @param callBack
 */
function geocoder(city, address) {
    return Q.Promise(function (resolve, reject) {
        var ak = 'LtijkUN4vj8mdG9tADeIjIp2'; //百度应用ak
        var output = 'json'; //返回数据格式
        address = urlencode.encode(address, 'utf8');
        city = urlencode.encode(city, 'utf8');
        var url = 'http://api.map.baidu.com/geocoder/v2/?ak=' + ak + '&output=' + output + '&address=' + address + '&city=' + city;
        request(url, function (error, response, body) {
            if (!body) {
                return reject({status: 500, result: 'API调用失败'});
            } else {
                var data = JSON.parse(body);
                console.info(data);
                return resolve(data);
            }
        })
    })
}


/**
 * 通过地址获取该地址经纬度信息
 * @param city
 * @param address
 * @returns {*}
 */
function addressToLatAndLon(city, address) {
    return Q.Promise(function (resolve, reject) {
        geocoder(city, address).then(function (data) {
            var status = data.status;
            if (status == 0) {
                console.log('正常调用');
                var location = data.result.location;
                return resolve({code:100,location:location});
            } else {
                console.log('非正常调用，地址数据不正确');
                return resolve({code:500,location:{}});
            }
        }).done(null, function (err) {
            console.log(err);
        });
    })
}

//function addressToLatAndLon2(city, address) {
//    var defered = Q.defer();
//    geocoder(city, address).then(function (data) {
//        var status = data.status;
//        if (status == 0) {
//            console.log('正常调用');
//            var location = data.result.location;
//            console.info(location);
//            defered.resolve(location);
//        } else {
//            defered.resolve(data);
//        }
//    }).done(null, function (err) {
//        defered.reject(err);
//    });
//    return defered.promise;
//}

/**
 * 计算经纬度之间的距离
 * @param lat1
 * @param lng1
 * @param lat2
 * @param lng2
 * @returns {number}
 */
function countDistance(lat1, lng1, lat2, lng2) {
    var EARTH_RADIUS = 6378.137
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
};


/**
 * 计算当前餐厅或供应商距离其他供应商和餐厅的距离
 * @param mechanismIdArray 需要计算距离的机构Id
 * @return jsons数组 例如：[{"mechanismId":"55acd2b92823176823b1f624","distance":6058.8}]，mechanismId为相对的餐厅或供应商id
 */
exports.getDistanceByMechanismId = function (req, res, mechanismIdArray) {
    var defer = Q.defer();
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var type = userInfo.userType;
            var openId = userInfo.openId;
            var array = new Array();
            mechanismIdArray.forEach(function (mechanismId) {
                array.push(new BSON.ObjectID(mechanismId));
            });
            //判断是否为餐厅用户
            if (type == 1) {
                //查询本人所属餐厅信息以及查询对应供应商的信息
                Q.all([Q.nfcall(mongodaDao.queryBy, {'_id': new BSON.ObjectID(mechanism_id)}, 'Restruant'),
                    Q.nfcall(mongodaDao.queryBy, {'_id': {$in: array}}, 'Supply')]).then(function (results) {
                    var restruant = results[0][0]
                    var supplyArray = results[1];
                    console.info("restruant:"+JSON.stringify(restruant));
                    console.info("supplyArray:"+JSON.stringify(supplyArray));
                    return getAddress(openId, restruant, supplyArray);
                }).then(function (data) {
                     defer.resolve(data);
                });
            } else {
                //查询本人所属供应商信息以及查询对应餐厅的信息
                Q.all([Q.nfcall(mongodaDao.queryBy, {'_id': new BSON.ObjectID(mechanism_id)}, 'Supply'),
                    Q.nfcall(mongodaDao.queryBy, {'_id': {$in: array}}, 'Restruant')]).then(function (results) {
                    var supply = results[0][0]
                    var restruantArray = results[1];
                    return getAddress(openId, supply, restruantArray);
                }).then(function (data) {
                     defer.resolve(data);
                });
            }
        }
    });
    return defer.promise;
}

function getAddress(openId, mechanism1, mechanismArray) {
    return Q.Promise(function (resolve, reject) {
        var city1 = mechanism1.area;
        var address1 = mechanism1.address;
        var city2;
        var address2;
        var mechanismId;
        var distanceProArray = new Array();
        mechanismArray.forEach(function (mechanism2) {
            mechanismId = mechanism2._id.toString();
            city2 = mechanism2.area;
            address2 = mechanism2.address;
            distanceProArray.push(getDistance(city1, address1, city2, address2,mechanismId));
        });
        Q.all(distanceProArray).then(function (distanceArray) {
            distanceArray.forEach(function(distanceJson){
                var mechanismId = distanceJson.mechanismId;
                var distance = distanceJson.distance;
                //缓存到redis
                redisDao.getInstance().hset(openId, mechanismId, distance);
            });
            return resolve(distanceArray);
        })
    });
}

function getDistance(city1, address1, city2, address2,mechanismId) {
    return Q.Promise(function (resolve, reject) {
        Q.all([addressToLatAndLon(city1, address1),
            addressToLatAndLon(city2, address2)]).then(function (data) {
            var location1 = data[0].location
            var location2 = data[1].location;
            var lat1, lng1, lat2, lng2;
            lat1 = location1.lat;
            lng1 = location1.lng;
            lat2 = location2.lat;
            lng2 = location2.lng;
            var distanceJson = {mechanismId:mechanismId,distance:countDistance(lat1, lng1, lat2, lng2) * 1000};
            return resolve(distanceJson);
        }).done(null,function(err){
            console.log(JSON.stringify(err));
        });
    });

}

