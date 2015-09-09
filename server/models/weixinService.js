var http = require('http');
var wechat = require('wechat');
var url = require('url');
var fs = require('fs');
var crypto = require("crypto");
var xml = require("node-xml/lib/node-xml.js");
var request = require('request');
var redisDao = require('../storage/redisDao');
var CronJob = require('cron').CronJob;
var crypto = require('crypto');
//微信接入校验
var isLegel = function (signature, timestamp, nonce) {
    var TOKEN = 'token2015';
    var arr = [TOKEN, timestamp, nonce];
    // 对三个参数进行字典序排序
    arr.sort();
    // sha1 加密
    var sha1 = crypto.createHash('s');
    var msg = arr[0] + arr[1] + arr[2];
    sha1.update(msg);
    msg = sha1.digest('hex');
    // 验证
    if (msg == signature) {
        console.log('验证成功');
        return true;
    } else {
        console.log('验证失败');
        return false;
    }
};

exports.checkout = function (app) {
    app.use('/weixin', wechat("token2015", function (req, res, next) {
        // 微信输入信息都在req.
        var message = req.weixin;
        var pathname = url.parse(req.url).pathname;  //pathname => select
        var arg = url.parse(req.url).query;          //arg => name=a&id=5
        if ((message.MsgType == 'event') && (message.Event == 'subscribe')) {
            var refillStr = "1. 点击记录团队充值"

            var consumeStr = "2. 点击记录团队消费"

            var deleteStr = "3. 点击回退记录"

            var historyStr = "4. 点击查询历史记录"

            var emptyStr = "          ";
            var replyStr = "感谢你的关注！" + "\n" + emptyStr + "\n" + refillStr + "\n" + emptyStr + "\n" + consumeStr
                + "\n" + emptyStr + "\n" + deleteStr + "\n" + emptyStr + "\n" + historyStr;
            res.reply(replyStr);
        } else if (message.MsgType == 'text') {
            var input = (message.Content || '').trim();
            if (input === '你好') {
                res.reply('你好');
            } else {
                res.reply('好！来一发');
            }
        }
    }));
}


//微信接入验证
exports.weixinCheck = function (req, res) {
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var check = false;
    check = isLegel(signature, timestamp, nonce, "token2015");//替换成你的token
    if (check) {
        res.write(echostr);
    } else {
        res.write("error data");
    }
    res.end();
}

//数据分析
var processMessage = function (data, response) {
//    console.log("data");
//    console.log(data);
//
//    var ToUserName = "";
//    var FromUserName = "";
//    var CreateTime = "";
//    var MsgType = "";
//    var Content = "";
//    var Location_X = "";
//    var Location_Y = "";
//    var Scale = 1;
//    var Label = "";
//    var PicUrl = "";
//    var FuncFlag = "";
//
//    var tempName = "";
//    var parse = new xml.SaxParser(function (cb) {
//        cb.onStartElementNS(function (elem, attra, prefix, uri, namespaces) {
//            tempName = elem;
//        });
//
//        cb.onCharacters(function (chars) {
//            chars = chars.replace(/(^\s*)|(\s*$)/g, "");
//            if (tempName == "CreateTime") {
//                CreateTime = chars;
//                /*}else if(tempName=="Location_X"){
//                 Location_X=cdata;
//                 }else if(tempName=="Location_Y"){
//                 Location_Y=cdata;*/
//            } else if (tempName == "Longitude") {
//                Location_X = chars;
//            } else if (tempName == "Latitude") {
//                Location_Y = chars;
//            } else if (tempName == "Scale") {
//                Scale = chars;
//            }
//        });
//
//        cb.onCdata(function (cdata) {
//            console.log("112233445566");
//            if (tempName == "ToUserName") {
//                ToUserName = cdata;
//            } else if (tempName == "FromUserName") {
//                FromUserName = cdata;
//            } else if (tempName == "MsgType") {
//                MsgType = cdata;
//            } else if (tempName == "Content") {
//                Content = cdata;
//            } else if (tempName == "PicUrl") {
//                PicUrl = cdata;
//            } else if (tempName == "Label") {
//                Label = cdata;
//            }
//            console.log("cdata:" + cdata);
//        });
//
//        cb.onEndElementNS(function (elem, prefix, uri) {
//            tempName = "";
//        });
//
//        cb.onEndDocument(function () {
//            console.log("onEndDocument");
//
//            tempName = "";
//            var date = new Date();
//            var yy = date.getYear();
//            var MM = date.getMonth() + 1;
//            var dd = date.getDay();
//            var hh = date.getHours();
//            var mm = date.getMinutes();
//            var ss = date.getSeconds();
//            var sss = date.getMilliseconds();
//            var result = Date.UTC(yy, MM, dd, hh, mm, ss, sss);
//            var msg = "";
//
//            MsgType = "location";
//            console.log(Content);
//            if (MsgType == "text") {
//                msg = "谢谢关注,你说的是：" + Content;
//                sendTextMessage(FromUserName, ToUserName, CreateTime, msg, Content.toString(), FuncFlag, response);
//            } else if (MsgType = "location") {
//                msg = "你所在的位置: 经度：" + Location_X + "纬度：" + Location_Y;
//                sendLocationMessage(FromUserName, ToUserName, msg, FuncFlag, response);
//            } else if (MsgType = "image") {
//                msg = "你发的图片是：" + PicUrl;
//                sendTextMessage(FromUserName, ToUserName, CreateTime, msg, Content.toString(), FuncFlag, response);
//            } else {
//                sendTextMessage(FromUserName, ToUserName, CreateTime, msg, Content.toString(), FuncFlag, response);
//            }
//
//
//        });
//    });
//    parse.parseString(data);
}
var messageSender = {};


var sendTextMessage = function (FromUserName, ToUserName, CreateTime, msg, Content, FuncFlag, response) {
    //console.log(arguments);

    var returnObj = {type: 'text', content: '雪飘七月竭诚为您服务：回复1：文本，回复2：图片，回复3：图文'};

    //console.log(wxdata)
    //if(wxdata[Content]){
    //    if(Content){
    //        returnObj = wxdata[Content];
    //    }
    //}

    var time = new Date().getTime();
    var resStr = "";
    if (returnObj.type == "text") {
        resStr = "<xml>" +
            "<ToUserName><![CDATA[" + FromUserName + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + ToUserName + "]]></FromUserName>" +
            "<CreateTime>" + time + "</CreateTime>" +
            "<MsgType><![CDATA[" + returnObj.type + "]]></MsgType>" +
            "<Content><![CDATA[" + returnObj.content + "]]></Content>" +
            "</xml>";
    } else if (returnObj.type == "image") {
        resStr = "<xml>" +
            "<ToUserName><![CDATA[" + FromUserName + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + ToUserName + "]]></FromUserName>" +
            "<CreateTime>" + time + "</CreateTime>" +
            "<MsgType><![CDATA[" + returnObj.type + "]]></MsgType>" +
            "<Image>" +
            "<MediaId><![CDATA[" + returnObj.content + "]]></MediaId>" +
            "</Image>" +
            "</xml>";
    } else if (returnObj.type == "news") {
        resStr = "<xml>" +
            "<ToUserName><![CDATA[" + FromUserName + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + ToUserName + "]]></FromUserName>" +
            "<CreateTime>" + time + "</CreateTime>" +
            "<MsgType><![CDATA[news]]></MsgType>" +
            "<ArticleCount>" + returnObj.articleCount + "</ArticleCount>" +
            "<Articles>";
        for (var i in returnObj.items) {
            var newsItem = returnObj.items[i];
            resStr = resStr + "<item>" +
                "<Title><![CDATA[" + newsItem.title + "]]></Title>" +
                "<Description><![CDATA[" + newsItem.description1 + "]]></Description>" +
                "<PicUrl><![CDATA[" + newsItem.picurl + "]]></PicUrl>" +
                "<Url><![CDATA[" + newsItem.url + "]]></Url>" +
                "</item>"
        }
        resStr = resStr + "</Articles>" +
            "</xml>";
    } else {
        resStr = "<xml>" +
            "<ToUserName><![CDATA[" + FromUserName + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + ToUserName + "]]></FromUserName>" +
            "<CreateTime>" + time + "</CreateTime>" +
            "<MsgType><![CDATA[text]]></MsgType>" +
            "<Content><![CDATA[error]]></Content>" +
            "</xml>";
    }
    response.send(resStr);
}


var sendLocationMessage = function (FromUserName, ToUserName, content, FuncFlag, response) {
    var time = new Date().getTime();
    var resStr = "";
    resStr = "<xml>" +
        "<ToUserName><![CDATA[" + FromUserName + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + ToUserName + "]]></FromUserName>" +
        "<CreateTime>" + time + "</CreateTime>" +
        "<MsgType><![CDATA[text]]></MsgType>" +
        "<Content><![CDATA[" + content + "]]></Content>" +
        "</xml>";
    response.send(resStr);
}


exports.weixin = function (req, res) {
    var response = res;
    var formData = "";
    req.on("data", function (data) {
        formData += data;
    });
    req.on("end", function () {
        processMessage(formData, response);
    });
}

//微信相关接口调用的方法封装
//1:获取access_token令牌接口var getAccess_token=function(){
exports.getAccess_token = function () {
        access_token();
    //每隔55分钟
    var job = new CronJob('*/55 * * * * ', function () {
        access_token();
    }, null, true, "Asia/Chongqing");
}
var access_token=function(){
    //console.log("调用access_token方法");
    request.get({
        url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxa1915b3016eef8ac&secret=688c3064e0b99003d509da0d02c3b1d6',
        formData: {}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            redisDao.getInstance().hset("access_token", "access_token_id", json.access_token);
            request.get({
                url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+json.access_token+'&type=jsapi',
                formData: {}
            }, function (error1, response1, body1) {
                if (!error1 && response1.statusCode == 200) {
                    var json1 = JSON.parse(body1);
                    redisDao.getInstance().hset("ticket", "ticket", json1.ticket);
                }
            });

        }
    });
}
////获取微信JSapi调用ticket
//var getJsapi_ticket=function(){
//    var job = new CronJob('50 */1 * * *', function () {
//        redisDao.getInstance().hgetall("access_token", function (err, data) {
//            var access_token=data.access_token_id;
//            request.get({
//                url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi',
//                formData: {}
//            }, function (error, response, body) {
//                if (!error && response.statusCode == 200) {
//                    var json = JSON.parse(body);
//                    console.log("json.ticket"+json.ticket);
//                    redisDao.getInstance().hset("ticket", "ticket", json.ticket);
//                }
//            });
//        });
//    }, null, true, "Asia/Chongqing");
//}

exports.getQMData=function(req,res){
       console.info('=====getQMData');
       var url=req.body.url;
       console.log("url:"+url);
       var appId='wxa1915b3016eef8ac';
       redisDao.getInstance().hgetall("ticket", function (err, data) {

           var ticket=data.ticket;
           console.log("ticket:"+ticket);
           var timestamp=createTimestamp();
           console.log("timestamp:"+timestamp);
           var nonceStr=createNonceStr();
           console.log("nonceStr:"+nonceStr);
           //先按照微信指定的规则生成jsapi_ticket
           var stringutil='jsapi_ticket='+ticket+'&noncestr='+nonceStr+'&timestamp='+timestamp+'&url='+url;
           //var jsapi_ticket={jsapi_ticket:ticket,nonceStr:nonceStr,timestamp:timestamp,url:url};
           //对生成的jsapi_ticket进行sha1加密
           //var signature=sign(jsapi_ticket).signature;
           console.log("stringutil:"+stringutil);
           var signature=sha1(stringutil);
           console.log("signature:"+signature);
           //动态的返回前天进行微信接口操作的数据
           return res.json({appId:appId,timestamp:timestamp,nonceStr:nonceStr,signature:signature});
       });

}

var sha1=function(str) {
        var md5sum = crypto.createHash('sha1');
        md5sum.update(str,'utf8');
        str = md5sum.digest('hex');
        return str;
}

var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

//var sign = function (jsapi_ticket) {
//    var ret = {
//        jsapi_ticket: jsapi_ticket,
//        nonceStr: createNonceStr(),
//        timestamp: createTimestamp(),
//        url: url
//    };
//    var string = raw(ret);
//    jsSHA = require('jssha');
//    shaObj = new jsSHA(string, 'TEXT');
//    ret.signature = shaObj.getHash('SHA-1', 'HEX');
//
//    return ret;
//};
//
//var raw = function (args) {
//    var keys = Object.keys(args);
//    keys = keys.sort()
//    var newArgs = {};
//    keys.forEach(function (key) {
//        newArgs[key.toLowerCase()] = args[key];
//    });
//
//    var string = '';
//    for (var k in newArgs) {
//        string += '&' + k + '=' + newArgs[k];
//    }
//    string = string.substr(1);
//    return string;
//};

exports.wxcallback = function (req, res) {
    res.json({status: 'ok'});
}