
var config = require('../../config');
var mongodaDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var underscore = require('underscore');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var userPromise = require('./userService').userPromise;

var sendMtemplate = require('./sendMtemplate');
var _ = require('underscore');
var request = require('request');
var ObjectID = require('mongodb').ObjectID
var url = require('url');
var urlencode = require('urlencode');


function massageSend(checkcode, mobile) {
    var username = 'keysusoftxly';
    var password = '4549405008436d1989139969333b49f6';
    var productid = '676767';
    //require('iconv-lite').decode('欢迎使用大白菜系统，此验证码只用于用户注册，验证码提供给他人将导致用户被盗'+checkcode+'【大白菜】', 'utf8');
    var content =  '欢迎使用大白菜系统，此验证码只用于用户注册，验证码提供给他人将导致用户被盗'+checkcode+'【大白菜】';
    content = urlencode.encode(content,'utf8');
    var url = "http://www.ztsms.cn:8800/sendSms.do?username=" + username + "&password=" + password + "&mobile=" + mobile + "&content=" + content + "&dstime=&productid=" + productid + "&xh="
    request.get({
        url: url,
        formData: {}
    }, function (error, response, body) {
        console.info(body);
    });
}

//验证该号码是否已存在
function checkUserName(mobile) {

    return Q.Promise(function (resolve, reject) {
        console.info('===2'+mobile);
        Q.nfcall(mongodaDao.queryBy, {userName: mobile}, 'User').then(function (users) {
            console.info(JSON.stringify(users));
            if (!users) {
                console.log('系统出错！');
                return resolve({code: 500, msg: '系统出错'});
            } else if (users.length > 0) {
                console.log('该号码已存在');
                return resolve({code: 200, msg: '该号码已经注册过'});
            }
            //该号码没有注册过
            else {
                return resolve({code:100});
            }
        }).catch(function(err){
            console.info(err);
            return reject(err);
        }).done(null,function(err){
            console.log(err);
        });
    });
}


//生成一个6位的数字的随机码
function getVerificationCode() {

    var m = 999999;
    var n = 100000;
    var code = Math.round(Math.random()*(n-m)+m)+'';
    return code;
}


//发送短信入口方法
exports.sendSmsAjax = function (req, res) {
    var mobile = req.body.mobile;
    var openId = req.body.openId;
    console.info('mobile:'+mobile+',openId:'+openId);
    checkUserName(mobile).then(function(result){
        console.info('result:'+JSON.stringify(result));
        if(result.code==100){
            //查询缓存
            redisDao.getInstance().hgetall( openId,function (err,userInfo) {
                //不存在，则生成新的code放入缓存中
                if (!userInfo) {
                    var checkcode = newCheckCodeByMobile(openId, mobile);
                    massageSend(checkcode,mobile);
                    return res.json({code:100});
                } else {
                    var now = Date.now();
                    var expireAt = userInfo.expireAt;
                    //判断验证码是否过期，如果过期了，就生成新的验证码
                    if (expireAt > now) {
                        console.log('验证码还有没有过期');
                        return res.json({code:400});
                    }
                    else {
                        var checkcode = newCheckCodeByMobile(openId, mobile);
                        massageSend(checkcode,mobile);
                        return res.json({code:100});
                    }
                }
            });
        }else{
            return res.json(result);
        }
    });
}


//生成新的验证码并放到缓存中
function newCheckCodeByMobile(openId, mobile) {
    //生成checkCode
    var checkCode = getVerificationCode();
    var now = Date.now();
    var expireAt = now + 60 * 1000; //60s后时效
    var isUse = false;
    redisDao.getInstance().hset(openId, "mobile", mobile);
    redisDao.getInstance().hset(openId, "checkCode", checkCode);
    redisDao.getInstance().hset(openId, "checkCoderateAt", now);
    redisDao.getInstance().hset(openId, "expireAt", expireAt);
    redisDao.getInstance().hset(openId, "isUse", isUse);
    return checkCode;
}


//验证验证码是否正确
function checkerCode(openId, mobile,code){
    return Q.Promise(function(resolve,reject){
        checkUserName(mobile).then(function(result){
            if(result.code==100){
                //查询缓存
                redisDao.getInstance().hgetall(openId,function (err,userInfo) {
                    console.info('----userInfo:'+JSON.stringify(userInfo));
                    if (!userInfo) {
                        return reject({code:500,msg:'该用户没有关注公众号'});
                    } else {
                        if(!userInfo.mobile){
                            console.log(mobile+'该用户没有发送短信获取验证码信息');
                            return reject({code:500,msg:'该用户没有发送短信获取验证码信息'})
                        }else if(userInfo.mobile!=mobile){
                            console.log('验证的电话号码:'+userInfo.mobile+'和提交的电话号码:'+mobile+'不对应');
                            return reject({code:500,msg:'验证的电话号码和提交的电话号码不对应'});
                        }
                        if(!userInfo.checkCode){
                            return reject({code:500,msg:'系统出错'});
                        }else if(userInfo.checkCode!= code){
                            return reject({code:500,msg:'验证码错误checkCode:'+userInfo.checkCode+',code:'+code});
                        }
                        var now = Date.now();
                        var expireAt = userInfo.expireAt;
                        if (expireAt > now && userInfo.checkCode===code) {
                            console.log('验证通过');
                            return resolve({code:100});
                        }else{
                            return reject({code:200,msg:'验证码过期，请重新获取验证码'});
                        }
                    }
                });
            }else{
                console.log(mobile+'该电话号码已经注册');
                return reject({code:400,msg:'该电话号码已经注册'});
            }
        });
    });
}

exports.checkerCode = checkerCode;