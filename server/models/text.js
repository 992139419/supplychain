var request = require('request');
var urlencode = require('urlencode');
var Q = require('q');

function text(){
    return Q.Promise(function (resolve, reject) {
        //var ak = 'LtijkUN4vj8mdG9tADeIjIp2'; //百度应用ak
        //var output = 'json'; //返回数据格式
        //address = urlencode.encode(address, 'utf8');
        //city = urlencode.encode(city, 'utf8');
       // var url = 'http://api.map.baidu.com/geocoder/v2/?ak=' + ak + '&output=' + output + '&address=' + address + '&city=' + city;
        var url = 'http://idabaicai.com/queryMaterialInfo';
        request(url, function (error, response, body) {
            if (!body) {
                return reject({status: 500, result: 'API调用失败'});
            } else {

                console.info(body);
                var code = body.code;
                console.info(code);
               // return resolve(data);
            }
        })
    })
}

text();