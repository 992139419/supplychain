var request = require('request');
var https=require('http');
//var CronJob = require('cron').CronJob;
var getAccess_token=function(){
    request.get({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxb1af4410bec7a315&secret=688e28e67180ff67db57b32e553118d5&code=04178ce8409a1549176ad05f44eafc3c&grant_type=authorization_code',
        formData:{}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            var json=JSON.parse(body);
            console.info(typeof json);
            console.log("1111"+json.access_token);

        }
    });
}
var sendMassage=function(){
    console.log("11111111111111");
    var  data={
        "touser":"ouYGlt6k_Qn4C6-5A9dB9CpQFS5Q",
        "template_id":"5G7We2qPnD_XQ-JS2doLrx7IuUp2v41R73PeyZj6skE",
        "url":"http://121.40.242.173/bingdingfriends",
        "topcolor":"#FF0000",
        "data":{
            "first": {
                "value":"恭喜你购买成功！",
                "color":"#173177"
            },
            "keynote1":{
                "value":"巧克力",
                "color":"#173177"
            },
            "keynote2": {
                "value":"39.8元",
                "color":"#173177"
            },
            "keynote3": {
                "value":"2014年9月16日",
                "color":"#173177"
            },
            "remark":{
                "value":"欢迎再次购买！",
                "color":"#173177"
            }

        }
    };
    request.post({
        url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=1Wv8NtL8QkxsrkUM5nl1z4XxPv8_s51Z6fcv_8JAHRp6G4XVr_rugAXFBfxSoUmvL02HUsBUFmDKrDoIg-UeKr5ICHCPDdr3vqOtxlTqpME',
        form:JSON.stringify(data)
    }, function(error, response, body) {
            console.log(body);

    });
}

var sendMassage01=function(){
    var json = {
        "touser":"ouYGlt6k_Qn4C6-5A9dB9CpQFS5Q",
        "template_id":"5G7We2qPnD_XQ-JS2doLrx7IuUp2v41R73PeyZj6skE",
        "url":"http://121.40.242.173/bingdingfriends",
        "topcolor":"#FF0000",
        "data":{
        }
    };
    var postData = 'payload=' + JSON.stringify(json);

    var options = {
        hostname: 'https://api.weixin.qq.com/cgi-bin/message/template',
        port: 80,
        path: '/send?access_token=3lQRpugfjTlx6CwjauZEibhnfNstIU7Q-U7sXwTflq2GLFyDPbHzfQmRx2yTz_SmfZXqu8fNUYKq9Kral8lM4u8s1hnsCweFky2Sa8cSpZI',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');
        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            console.log(responseString);
        });
    });

    req.on('error', function (e) {
        console.log('something error.');
    });

    req.write(postData);
    req.end();
}
//function onBridgeReady(){
//    WeixinJSBridge.invoke(
//        'getBrandWCPayRequest', {
//            "appId" : "wx2421b1c4370ec43b",     //公众号名称，由商户传入
//            "timeStamp":" 1395712654",         //时间戳，自1970年以来的秒数
//            "nonceStr" : "e61463f8efa94090b1f366cccfbbb444", //随机串
//            "package" : "prepay_id=u802345jgfjsdfgsdg888",
//            "signType" : "MD5",         //微信签名方式:
//            "paySign" : "70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
//        },
//        function(res){
//            if(res.err_msg == "get_brand_wcpay_request:ok" ) {}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
//        }
//    );
//}
//if (typeof WeixinJSBridge == "undefined"){
//    if( document.addEventListener ){
//        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//    }else if (document.attachEvent){
//        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//    }
//}else{
//    onBridgeReady();
//}

getAccess_token();
//sendMassage();
//sendMassage01();





