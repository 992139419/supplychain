var request = require('request');
var https = require('http');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
//发送信息模版
//邀请朋友模版001
//touser  该模版发给那个用户openId
exports.sendMtemplate001 = function (touser, formUserName, toUserName, accepterMid, senderMid, senderType, accepterType) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var data = {
            "touser": touser,
            "template_id": "8rauTIVoa4RBFForY0EmcCImVti3i61P5l_vTg_6u0M",
            "url": "http://www.idabaicai.com/bingdingfriends?sender=" + formUserName + "&accepter=" + toUserName + "&accepterMid=" + accepterMid + "&senderMid=" + senderMid + "&senderType=" + senderType + "&accepterType=" + accepterType+"&openId="+touser,
            "topcolor": "#FF0000",
            "data": {}
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}

//餐厅发送询价模版002
exports.sendMtemplate002 = function (inquerySheetId, touser,restruantdName,telephone) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var data = {
            "touser": touser,
            "template_id": "9PYr5N3K6CFPevOqf_ieSsMRRd3qbSF8hD0UDVoW5A0",
            "url": "http://www.idabaicai.com/qryInqueryByIdCommon?openId=" + touser + "&oId=" + inquerySheetId+"&isHead=true",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':'尊敬的用户，您有一条新的询价信息。',
                    'color':'#000000'
                },
                //询价用户(餐厅)
                'keyword1':{
                    'value':restruantdName,
                    'color':'#000000'
                },
                //联系方式
                'keyword2':{
                    'value':telephone,
                    'color':'#000000'
                },
                //电子邮箱
                'keyword3':{
                    'value':'',
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}

//供应商发送报价单模版003
exports.sendMtemplate003 = function (offerSheetId, supplyName, touser) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var data = {
            "touser": touser,
            "template_id": "cuf2Ch0LeDfVHHFGsIZGxYhUgglSOrP4qZtz3aN21Ro",
            "url": "http://www.idabaicai.com/qryOfferSheetByIdCommon?openId=" + touser + "&offerSheetId=" + offerSheetId + "&supplyName=" + supplyName+"&isHead=true",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':'尊敬的用户，您有一条新的报价信息。',
                    'color':'#000000'
                },
                //报价单编号
                'keyword1':{
                    'value':offerSheetId,
                    'color':'#000000'
                },
                //联系方式
                'keyword2':{
                    'value': commonUtil.formatDate(new Date(),'yyyy-MM-dd hh:mm'),
                    'color':'#000000'
                },"remark":{
                    'value':'报价供应商:'+supplyName,
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}

//供应商发送订单模版004
exports.sendMtemplate004 = function (orderId, touser,receiverAddress,sum,orderStatus,supplyName,restruantName,orderNo) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data){
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var remark,firstStr;

            firstStr = ' 尊敬的客户您好！您有一份新订单！订单编号为'+orderNo;
            remark = '订单所属餐厅:'+restruantName;
        var data = {
            "touser": touser,
            "template_id": "gTLDv8h15DpMb2fn6cUyWkzrl4N9WyD1KF0ZS3hINog",
            "url": "http://www.idabaicai.com/getOrderByIdModel?ordId="+orderId+"&hasHead=true&openId=" + touser +"&isHead=true",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':firstStr,
                    'color':'#000000'
                },
                // 时间
                'keyword1':{
                    'value':commonUtil.formatDate(new Date(),'yyyy-MM-dd hh:mm'),
                    'color':'#000000'
                },
                //地址
                'keyword2':{
                    'value':receiverAddress,
                    'color':'#000000'
                },
                //订单总额
                'keyword3':{
                    'value': sum,
                    'color':'#000000'
                },
                //订单备注
                'keyword4':{
                    'value':'',
                    'color':'#000000'
                },"remark":{
                    'value':remark,
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}



//供应商发送配送订单模版005
exports.sendMtemplate005 = function (orderId, touser,receiverAddress,sum,orderStatus,supplyName,restruantName,orderNo) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var remark,firstStr;
            firstStr = ' 尊敬的客户您好！您有一份新配送单！日期：'+commonUtil.formatDate(new Date(),'yyyy-MM-dd hh:mm');
            remark = '供应商名称:'+supplyName;
        var data = {
            "touser": touser,
            "template_id": "t-SqYrWXaUgqMCWUlUh-jgksVrJ8odS0LoSggjejUqc",
            "url": "http://www.idabaicai.com/getOrderByIdModel?ordId="+orderId+"&hasHead=true&openId=" + touser +"&isHead=true",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':firstStr,
                    'color':'#000000'
                },
                // 订单号
                'keyword1':{
                    'value':orderNo,
                    'color':'#000000'
                },
                //商家名称
                'keyword2':{
                    'value':supplyName,
                    'color':'#000000'
                },
                //配送员
                'keyword3':{
                    'value': '',
                    'color':'#000000'
                },
                //联系电话
                'keyword4':{
                    'value':'',
                    'color':'#000000'
                },"remark":{
                    'value':remark,
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}
//供应商发送验收订单模版006
exports.sendMtemplate006 = function (orderId, touser,receiverAddress,sum,orderStatus,supplyName,restruantName,orderNo) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var remark,firstStr;

        firstStr = '尊敬的客户您好！您有一份确认收货单！订单编号为'+orderNo;
        remark = '感谢您为我们餐厅提供优质的食材';

        var data = {
            "touser": touser,
            "template_id": "R_028SKAWKCRYhnyLKUowSJrEndnlW3kWR2gR3eCc2o",
            "url": "http://www.idabaicai.com/getOrderByIdModel?ordId="+orderId+"&hasHead=true&openId=" + touser +"&isHead=true",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':firstStr,
                    'color':'#000000'
                },
                // 订单号
                'keyword1':{
                    'value':restruantName,
                    'color':'#000000'
                },
                //商家名称
                'keyword2':{
                    'value':commonUtil.formatDate(new Date(),'yyyy-MM-dd hh:mm'),
                    'color':'#000000'
                },"remark":{
                    'value':remark,
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}


//邀请组员成功或失败回调模版007
exports.sendMtemplate007 = function (touser,name,mechanism_id,mechanismName,headMechanismId,status,massege) {
    //获取微信令牌并发送模版信息
    redisDao.getInstance().hgetall("access_token", function (err, data) {
        var access_token = data.access_token_id;
        //var access_token="msZRBh4WkJiU50PPRwZvckfr2jsRjOjuUp8Zk9hvHRlQfIrcfHu51jCH5kp5y756_6l0n9bsjTnT2jjppHpyHbfK8D9idegLms78-GcKghE";
        var remark,firstStr;
        console.info('status:'+status);
        if(status==='1'){
            firstStr = '邀请组员成功';
            remark = '您的好友'+name+'已成功接受邀请,成为'+mechanismName+'的新组员';
        }else if(status==='-1'){
            firstStr = '邀请组员失败';
            remark = '邀请好友'+name+'失败,'+massege;
        }else if(status==='2'){
            firstStr = '邀请常用联系人成功';
            remark = '您的好友'+name+'已成功接受邀请,成为您的常用联系人';
        }else if(status==='-2'){
            firstStr = '邀请常用联系人失败';
            remark = '邀请好友'+name+'作为常用联系人失败,'+massege;
        }
        var data = {
            "touser": touser,
            "template_id": "-5s58OSC2bameKXZBWT6bKXyobBCv35RClQ0ro-SelM",
            "url": "",
            "topcolor": "#FF0000",
            "data": {
                "first":{
                    'value':firstStr,
                    'color':'#000000'
                },
                // 好友名称
                'keyword1':{
                    'value':name,
                    'color':'#000000'
                },
                //注册时间
                'keyword2':{
                    'value':commonUtil.formatDate(new Date(),'yyyy-MM-dd hh:mm'),
                    'color':'#000000'
                },"remark":{
                    'value':remark,
                    'color':'#000000'
                }
            }
        };
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token,
            form: JSON.stringify(data)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });
}

