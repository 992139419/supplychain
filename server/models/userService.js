/**
 * ajax status Table
 * 101: 登录成功
 * 102: 没有该用户 请注册
 * 103: 系统数据错误
 * 104: 用户名或者密码错误 请重新输入
 * 105: 已经注册 请直接登录
 */
var mongodaDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();
var Q = require('q');
var url = require('url');
var http = require('http');
var sms = require('./sms');
var request = require('request');
var sendMtemplate = require('./sendMtemplate');
var initDataForTourist = require('./initDataForTourist');

function getOpenId(req) {
    var openId;
    openId = req.query.openId;
    if (!openId) {
        openId = req.body.openId;
    }
    return openId;
}

exports.getOpenId = getOpenId;
function userPromise(req, res) {
    var openId = getOpenId(req);
    return Q.Promise(function (resolve, reject) {
        if (openId && openId != 'undefined') {
            redisDao.getInstance().hgetall(openId, function (err, userInfo) {
                var _data = null;
                if (err) {
                    return reject(err);
                }
                if (userInfo) {
                    if (!userInfo.mechanism_id && userInfo.mechanism_id != 'underfied') {
                        return res.render('admin/choose', {openId: userInfo.openId});
                    } else {
                        _data = {
                            id: userInfo.id,
                            userName: userInfo.userName,
                            mechanism_id: userInfo.mechanism_id,
                            mechanism_name: userInfo.mechanism_name,
                            userType: userInfo.userType,
                            userAuth: userInfo.userAuth,
                            openId: userInfo.openId,
                            isConfirme: userInfo.isConfirme,
                            headMechanismId: userInfo.headMechanismId,
                            isGuest: userInfo.isGuest,
                            isAvab: userInfo.isAvab
                        }
                    }
                }
                //判断缓存中是否有该用户数据，没有则跳到登录页面
                else {
                    return res.render('admin/remind', {msg: '用户登录信息以过期，请重新登录'});
                }
                return resolve(_data);
            });
        } else {
            return res.render('admin/remind', {msg: '非正常打开'});
        }
    });
}
exports.userPromise = userPromise;


function getSessionId(req) {
    var sessionId;
    sessionId = req.sessionID;
    if (!sessionId) {
        sessionId = req.body.sessionId;
    }
    return sessionId;
}
//CMS 系统proise方法
var cUserPromise = function (req, res) {
    var sessionId = getSessionId(req);
    if (sessionId && sessionId != 'undefined') {
        return Q.Promise(function (resolve, reject) {
            redisDao.getInstance().hgetall(sessionId, function (err, userInfo) {
                if (err) {
                    return reject(err);
                }
                return resolve(userInfo);
            });
        });
    } else {
        return res.json({status: '非正常打开.'});
    }
}

exports.cmsPromise = cUserPromise;

/**
 * 浏览器调试入口
 * @param req
 * @param res
 */
exports.wxTest = function (req, res) {

    //var openId = 'oQmXLvsga1kd9fCrcL6rsP4bhGZ0';
    //var userType = '1';

    //var openId = 'oQmXLvqj27L5XvfAcWwz63-xuJ24';
    //var userType = '2';

    var openId = 'oQmXLvttioLZ3Q9KMsWh11ynR8Vw';
    var userType = '1';

    //var openId = 'oQmXLvnC0lKk-0s31lPwMNprhThA';
    //var userType = '1';

    var userData = {openId: openId, userType: userType};
    mongodaDao.queryBy({openId: openId}, 'User', function (err, user) {
        if (!!err) {
            logger.error("数据库操作出问题");
            res.render('/500');
        } else if (user.length == 0) {
            logger.error("数据表数据问题,因为关注的该微信 一定有该微信的openId" + openId);
            res.render('admin/remind', {msg: "抱歉！由于系统的故障原因你的信息没有被该系统准确录入，请先取消关注微信号的关注,再重新关注。"});
        } else if (user.length == 1) {
            var mechanism_id = user[0].mechanism_id;
            var headMechanismId = user[0].headMechanismId;
            var isAvab = user[0].isAvab;
            var userName = user[0].userName;
            var isGuest = user[0].isGuest;
            //判断用户禁用
            isAvabByUser(req, res, isAvab, headMechanismId, mechanism_id, userType).then(function (result) {

                return result;
                //判断是否游客
            }).then(function (result) {
                //判断是否注册
                if (!userName) {
                    redisDao.getInstance().hset(openId, "openId", openId);
                    redisDao.getInstance().hset(openId, "userType", userType);
                    return res.render('admin/register', {openId: openId, userType: userType});
                }
                //判断是否为为游客
                if (isGuest == '0') {

                    redisDao.getInstance().hset(openId, "id", user[0]._id);
                    redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                    redisDao.getInstance().hset(openId, "mechanism_id", user[0].mechanism_id ? user[0].mechanism_id : '');
                    redisDao.getInstance().hset(openId, "mechanism_name", user[0].mechanism_name ? user[0].mechanism_name : '');
                    redisDao.getInstance().hset(openId, "userType", userType);
                    redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                    redisDao.getInstance().hset(openId, "openId", user[0].openId);
                    redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                    redisDao.getInstance().hset(openId, "headMechanismId", user[0].headMechanismId ? user[0].headMechanismId : '');
                    redisDao.getInstance().hset(openId, "isAvab", user[0].isAvab ? user[0].isAvab : 'true');
                    redisDao.getInstance().hset(openId, "isGuest", user[0].isGuest ? user[0].isGuest : '1');
                    redisDao.getInstance().expire(openId, 36000); // 10 hours
                    return res.render('admin/choose', {openId: openId});
                }

                return true;

            }).then(function (noisGuest) {

                if (noisGuest == true) {

                    //判断是否当前机构用户

                    if (user[0].userType != userType) {
                        res.render('admin/remind', {msg: '你已经使用该微信号注册了一个供货商用户并且有了供货商机构，所以不能在注册一个餐厅用户'});
                    } else if (user[0].userName == user[0].openId) {
                        return res.render('admin/modifyName', {title: "修改名字", openId: openId});
                    }
                    else {
                        redisDao.getInstance().hset(openId, "id", user[0]._id);
                        redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                        redisDao.getInstance().hset(openId, "mechanism_id", user[0].mechanism_id ? user[0].mechanism_id : '');
                        redisDao.getInstance().hset(openId, "mechanism_name", user[0].mechanism_name ? user[0].mechanism_name : '');
                        redisDao.getInstance().hset(openId, "userType", user[0].userType ? user[0].userType : '');
                        redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                        redisDao.getInstance().hset(openId, "openId", user[0].openId);
                        redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                        redisDao.getInstance().hset(openId, "headMechanismId", user[0].headMechanismId ? user[0].headMechanismId : '');
                        redisDao.getInstance().hset(openId, "isAvab", user[0].isAvab ? user[0].isAvab : 'true');
                        redisDao.getInstance().hset(openId, "isGuest", user[0].isGuest ? user[0].isGuest : '1');
                        redisDao.getInstance().expire(openId, 36000); // 10 hours
                        if (userType == '2') {
                            return res.redirect('/supIndex?openId=' + openId);
                        } else {
                            return res.redirect('/resIndex?openId=' + openId);
                        }
                    }
                }
            }).done(null, function (err) {
                console.log(err);
            });
        } else if (user.length > 1) {
            logger.error("数据表数据问题,该用户在数据表中存在多条数据  openId" + openId);
            res.render('/500');
        }
    });

}
//微信入口处理
exports.weixinlogin = function (req, res) {
    //var openId = req.sessionID;
    //通过页面Oauth授权后获取Code
    var userType = req.query.userType;
    var code = req.query.code;
    request.get({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxa1915b3016eef8ac&secret=688c3064e0b99003d509da0d02c3b1d6&code=' + code + '&grant_type=authorization_code',
        formData: {}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            var openId = json.openid;
            mongodaDao.queryBy({openId: openId}, 'User', function (err, user) {
                if (!!err) {
                    logger.error("数据库操作出问题");
                    res.render('/500');
                } else if (user.length == 0) {
                    logger.error("数据表数据问题,因为关注的该微信 一定有该微信的openId" + openId);
                    res.render('admin/remind', {msg: "抱歉！由于系统的故障原因你的信息没有被该系统准确录入，请先取消关注微信号的关注,再重新关注。"});
                } else if (user.length == 1) {
                    var mechanism_id = user[0].mechanism_id;
                    var headMechanismId = user[0].headMechanismId;
                    var isAvab = user[0].isAvab;
                    var userName = user[0].userName;
                    var isGuest = user[0].isGuest;
                    //判断用户禁用
                    isAvabByUser(req, res, isAvab, headMechanismId, mechanism_id, userType).then(function (result) {
                        return result;
                        //判断是否游客
                    }).then(function (result) {
                        //判断是否注册
                        if (!userName) {
                            redisDao.getInstance().hset(openId, "openId", openId);
                            redisDao.getInstance().hset(openId, "userType", userType);
                            return res.render('admin/register', {openId: openId, userType: userType});
                        }

                        //判断是否为为游客
                        if (isGuest == '0') {
                            redisDao.getInstance().hset(openId, "id", user[0]._id);
                            redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                            redisDao.getInstance().hset(openId, "mechanism_id", user[0].mechanism_id ? user[0].mechanism_id : '');
                            redisDao.getInstance().hset(openId, "mechanism_name", user[0].mechanism_name ? user[0].mechanism_name : '');
                            redisDao.getInstance().hset(openId, "userType", userType);
                            redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                            redisDao.getInstance().hset(openId, "openId", user[0].openId);
                            redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                            redisDao.getInstance().hset(openId, "headMechanismId", user[0].headMechanismId ? user[0].headMechanismId : '');
                            redisDao.getInstance().hset(openId, "isAvab", user[0].isAvab ? user[0].isAvab : 'true');
                            redisDao.getInstance().hset(openId, "isGuest", user[0].isGuest ? user[0].isGuest : '1');
                            redisDao.getInstance().expire(openId, 36000); // 10 hours
                            return res.render('admin/choose', {openId: openId});
                        }

                        return true;

                    }).then(function (noisGuest) {
                        if (noisGuest == true) {
                            //判断是否当前机构用户
                            if (user[0].userType != userType) {
                                if(user[0].userType==='1'){
                                    res.render('admin/remind', {msg: '你已经使用该微信号注册了一个餐厅用户并且有了供货商机构，所以不能在注册供应商用户'});
                                }else{
                                    res.render('admin/remind', {msg: '你已经使用该微信号注册了一个供货商用户并且有了供货商机构，所以不能在注册餐厅用户'});
                                }
                            } else if (user[0].userName == user[0].openId) {
                                return res.render('admin/modifyName', {title: "修改名字", openId: openId});
                            }
                            else {
                                redisDao.getInstance().hset(openId, "id", user[0]._id);
                                redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                                redisDao.getInstance().hset(openId, "mechanism_id", user[0].mechanism_id ? user[0].mechanism_id : '');
                                redisDao.getInstance().hset(openId, "mechanism_name", user[0].mechanism_name ? user[0].mechanism_name : '');
                                redisDao.getInstance().hset(openId, "userType", user[0].userType ? user[0].userType : '');
                                redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                                redisDao.getInstance().hset(openId, "openId", user[0].openId);
                                redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                                redisDao.getInstance().hset(openId, "headMechanismId", user[0].headMechanismId ? user[0].headMechanismId : '');
                                redisDao.getInstance().hset(openId, "isAvab", user[0].isAvab ? user[0].isAvab : 'true');
                                redisDao.getInstance().hset(openId, "isGuest", user[0].isGuest ? user[0].isGuest : '1');
                                redisDao.getInstance().expire(openId, 36000); // 10 hours
                                if (userType == '2') {
                                    return res.redirect('/supIndex?openId=' + openId);
                                } else {
                                    return res.redirect('/resIndex?openId=' + openId);
                                }
                            }
                        }
                    }).done(null, function (err) {
                        console.log(err);
                    });
                } else if (user.length > 1) {
                    logger.error("数据表数据问题,该用户在数据表中存在多条数据  openId" + openId);
                    res.render('/500');
                }
            });
        }
    });
}
//我的组员邀请回调
exports.getUserInfo = function (req, res) {
    var code = req.query.code;
    var invitId = req.query.invitId;
    console.info('code:' + code);
    var userType = req.query.userType;
    var mechanism_id = req.query.mid;
    var name = req.query.name;
    var headMechanismId = req.query.headMechanismId;
    var headMechanismName = req.query.headMechanismName;
    console.log("mechanism_id" + mechanism_id + "name" + name + "headMechanismId" + headMechanismId + "headMechanismName" + headMechanismName);
    request.get({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxa1915b3016eef8ac&secret=688c3064e0b99003d509da0d02c3b1d6&code=' + code + '&grant_type=authorization_code',
        formData: {}
    }, function (error, response, body) {
        console.log('101');
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            var access_token = json.access_token;
            var openId = json.openid;
            var openIdData = {openId: openId, status: "1"};
            //当前点击的ID  判断ID是否关注过该微信服务号 没有关注提醒关注,并且根据邀请状态添加该用户，后面只要用户关注该公众号，就不用再邀请{
            mongodaDao.queryBy(openIdData, 'User', function (err, data1) {
                if (!!err || data1.length > 1) {
                    return res.render('/500');
                } else if (data1.length == 0) {
                    return res.render('common/focus');
                } else if (data1.length == 1) {
                    var mUserType = data1[0].userType;
                    console.log("mUserType" + mUserType + "userType" + userType);
                    //验证接受邀请的用户跟headMechanismId发起邀请的用户是否为同一个类型用户
                    redisDao.getInstance().hgetall("access_token", function (err, data) {
                        var access_token = data.access_token_id;
                        request('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN', function (err, response, body) {
                            if (err) return res.render('/500');
                            var userInfo = JSON.parse(body);
                            var nicknameWx = userInfo.nickname;
                            var massege = '';
                            console.info(userInfo);
                             if (!!mUserType && mUserType != userType) {
                                massege = '你跟对方不是同一个机构类型，故添加组员无法完成添加';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, mechanism_id, name, headMechanismId, '-1', massege);
                                return res.render('admin/remind', {msg: massege});
                                //验证接受邀请的用户是否为已经加入了其他机构
                            } else if ((!data1[0].isGuest || data1[0].isGuest != 0) && !!mUserType && !!data1[0].headMechanismId && (headMechanismId != data1[0].headMechanismId)) {
                                massege = '对方已经成为其他机构的组员'
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, mechanism_id, name, headMechanismId, '-1', massege);
                                return res.render('admin/remind', {msg: '添加组员失败，失败原因：你已经成为其他机构的组员'});
                            } else if (!!mUserType && !!data1[0].headMechanismId && (headMechanismId == data1[0].headMechanismId)) {
                                massege = '对方本来就是组员'
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, mechanism_id, name, headMechanismId, '-1', massege);
                                return res.render('admin/remind', {msg: '你本来就是组员'});
                            } else {
                                var nickname = userInfo.openid;
                                var headimgurl = userInfo.headimgurl;
                                var updateData = {
                                    userName: openId,
                                    userType: userType,
                                    openId: openId,
                                    source: '1',
                                    userAuth: '0',
                                    isConfirm: '0',
                                    isGuest: '1',
                                    headMechanismId: headMechanismId,
                                    headMechanismName: headMechanismName,
                                    mechanism_id: mechanism_id,
                                    mechanism_name: name
                                }
                                //帮他注册，并添加为组员,设置总店id和分店id
                                mongodaDao.updateOrSave({openId: openId}, updateData, 'User', function (err, data2) {
                                    if (err) {
                                        logger.error('数据库操作问题');
                                        return res.render('/500');
                                    } else {
                                        sendMtemplate.sendMtemplate007(invitId, nicknameWx, mechanism_id, name, headMechanismId, '1', '成功');
                                        return res.render('admin/remind', {msg: '已经成功添加组员'})
                                    }
                                });
                            }
                        });
                    });
                } else if (data1.length > 1) {
                    logger.error('数据库数据问题 一个openId 出现多个用户');
                    return res.render('/500');
                }
            });
        }
    });
}

//添加常用联系人的回调,对于常用联系人的添加，要求是其必须先成为会员，不然其并没有机构id
exports.addContactCallBack = function (req, res) {
    var code = req.query.code;
    var sender = req.query.sender;
    var senderMid = req.query.senderMid;
    var senderHMid = req.query.senderHMid;
    var senderType = req.query.senderType;
    var invitId = req.query.invitId;
    var accepter = '';
    var accepterMid = '';
    var accepterType = '';
    request.get({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxa1915b3016eef8ac&secret=688c3064e0b99003d509da0d02c3b1d6&code=' + code + '&grant_type=authorization_code',
        formData: {}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            var openId = json.openid;
            var openIdData = {openId: openId, status: "1"};
            mongodaDao.queryBy(openIdData, 'User', function (err, data1) {
                redisDao.getInstance().hgetall("access_token", function (err, data) {
                    var access_token = data.access_token_id;
                    request('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN', function (err, response, body) {
                        var userInfo = JSON.parse(body);
                        var nickname = userInfo.openid;
                        var headimgurl = userInfo.headimgurl;
                        var nicknameWx = userInfo.nickname;
                        var massege = '';
                        if (!!err || data1.length > 1) {
                            return res.render('/500');
                        } else if (data1.length == 0) {
                            massege = '对方没有关注本公众平台';
                            sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid, '', '', '-2', massege);
                            return res.render('common/focus');
                        } else if (data1.length == 1) {
                            var mUserType = data1[0].userType;
                            if (!(data1[0].isGuest)) {
                                massege = '对方没有注册成为本系统用户';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid, '', '', '-2', massege);
                                return res.render('admin/remind01', {msg: '添加的常用联系人必须先注册为餐厅或者供货商用户'});
                            } else if (!!(data1[0].isGuest) && data1[0].isGuest == 0) {
                                massege = '对方没有加入任何餐厅或供应商';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid, '', '', '-2', massege);
                                return res.render('admin/remind01', {msg: '你还是一个游客身份故添加常用联系人，请点击免费使用，添加机构！'});
                            } else if (!!mUserType && mUserType == senderType) {
                                massege = '对方为同一个机构类型，加常用联系人无法成功添加';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid, '', '', '-2', massege);
                                return res.render('admin/remind01', {msg: '你跟邀请者是同一个机构类型，故添加常用联系人无法成功添加。'});
                                //验证接受邀请的用户是否为已经加入了其他机构
                            } else if (!data1[0].mechanism_id) {
                                massege = '对方没有加入任何餐厅或供应商';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid, '', '', '-2', massege);
                                return res.render('admin/remind', {msg: '亲  添加的常用联系人必须先注册为餐厅或者供货商用户'});
                            } else if (data1[0].mechanism_id) {
                                accepter = data1[0].openId;
                                accepterHMid = data1[0].headMechanismId;
                                accepterMid = data1[0].mechanism_id;
                                accepterType = data1[0].userType;
                                console.log("sender" + sender + "senderMid" + senderMid + "senderType" + senderType + "accepter" + accepter + "accepterMid" + accepterMid + "accepterType" + accepterType);
                                massege = '成功';
                                sendMtemplate.sendMtemplate007(invitId, nicknameWx, senderMid ,'', '', '2', massege);
                                res.redirect('/addContacts?sender=' + sender + "&senderMid=" + senderMid+ "&senderHMid=" + senderHMid + '&senderType=' + senderType + '&accepter=' + accepter + '&accepterMid=' + accepterMid +'&accepterHMid=' + accepterHMid+ '&accepterType=' + accepterType);
                            } else {
                                return res.render('/500');
                            }
                        } else if (data1.length > 1) {
                            logger.error('数据库数据问题 一个openId 出现多个用户');
                            return res.render('/500');
                        }
                    });
                });
            });
        }
    });
}

exports.login = function (req, res) {
    var openId = getOpenId(req);
    var userName = req.body.userName;
    var password = req.body.password;
    //如果有open
    var userData = {userName: userName, password: password};
    mongodaDao.queryBy(userData, 'User', function (err, data) {
        if (!!err) {
            logger.error("数据库操作出问题");
            return res.json({code: 103});
        } else if (data && data.length == 0) {
            return res.json({code: 102});
        } else if (data && data.length > 1) {
            logger.error("There are over one more users registered in ID " + userName + "! please find out the reason ASAP.");
            return res.json({code: 103});
        } else {
            if (userData.password == data[0].password) {
                var userType = data[0].userType;
                redisDao.getInstance().hset(openId, "id", data[0]._id);
                redisDao.getInstance().hset(openId, "userName", data[0].userName ? data[0].userName : '');
                redisDao.getInstance().hset(openId, "mechanism_id", data[0].mechanism_id ? data[0].mechanism_id : '');
                redisDao.getInstance().hset(openId, "mechanism_name", data[0].mechanism_name ? data[0].mechanism_name : '');
                redisDao.getInstance().hset(openId, "userType", data[0].userType ? data[0].userType : '');
                redisDao.getInstance().hset(openId, "userAuth", data[0].userAuth ? data[0].userAuth : '');
                redisDao.getInstance().hset(openId, "openId", data[0].openId);
                redisDao.getInstance().hset(openId, "isConfirme", data[0].isConfirme ? data[0].isConfirme : '');
                redisDao.getInstance().hset(openId, "headMechanismId", data[0].headMechanismId);
                redisDao.getInstance().expire(openId, 36000); // 10 hours

                if (!!data[0].mechanism_id) {
                    if (userType == 1) {
                        return res.json({code: 1010});
                    } else if (userType == 2) {
                        return res.json({code: 1011});
                    }
                } else {
                    return res.json({code: 1012});
                }
                //return res.redirect('/admin');

            } else {
                return res.json({code: 104});
            }
        }
    });
}


exports.logout = function (req, res) {
    redisDao.getInstance().del(req.query.openId, function (err, data) {

        if (err) {
            console.log(err);
        }
        console.log(data);
    });
    res.render("admin/login", {openId: req.query.openId});
}

//注册登录后,他就要会
exports.register = function (req, res) {
    var openId = getOpenId(req);
    var userName = req.body.mPhoneNumber;
    var password = req.body.password;
    var userType = req.body.userType;
    var code = req.body.code;
    var userData = {
        userName: userName,
        password: password,
        openId: openId,
        userType: userType,
        source: '0',
        userAuth: '0',
        isGuest: '0',
        isConfirme: '0'
    };
    //判断验证码是否正确
    sms.checkerCode(openId, userName, code).then(function (result) {
        console.info(JSON.stringify(result));
        mongodaDao.queryBy({openId: openId, userType: userType}, 'User', function (err, data1) {
            console.info(JSON.stringify(data1));
            if (!!err) {
                logger.error("数据库操作出问题");
                return res.json({code: 103});
            } else if (data1 && data1.length == 1) {
                console.log('注册用户时，数据库已存在改用户，用户已经注册')
                return res.json({code: 105});
            } else if (data1 && data1.length == 0) {
                console.info('----0' + openId);
                mongodaDao.update({openId: openId}, userData, 'User', function (err, data2) {
                    console.info("err:" + err);
                    if (!!err) {
                        logger.error('数据库操作问题');
                        return res.json({code: 103});
                    } else {
                        redisDao.getInstance().hset(openId, "userName", userData.userName);
                        redisDao.getInstance().hset(openId, "userType", userData.userType);
                        redisDao.getInstance().hset(openId, "openId", userData.openId);
                        redisDao.getInstance().hset(openId, "source", userData.source);
                        redisDao.getInstance().hset(openId, "userAuth", userData.userAuth);
                        redisDao.getInstance().hset(openId, "isConfirme", userData.isConfirme);
                        redisDao.getInstance().hset(openId, "isGuest", userData.isGuest);
                        //注册登录的，
                        redisDao.getInstance().hset(openId, "headMechanismId", "");
                        redisDao.getInstance().hset(openId, "mechanism_id", "");
                        redisDao.getInstance().expire(openId, 36000); // 10 hours
                        return res.json({code: 101});
                    }
                });
            }
        });
    }).done(null, function (err) {
        console.log(JSON.stringify(err));
        return res.json(err);
    });

}

//第一次注册以后的页面选择跳转,1:免费使用,2:随便看看
exports.choose = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, userInfo) {
        var userType = userInfo.userType;
        if (userType == '1') {
            return res.redirect('/resIndex?openId=' + userInfo.openId);
        } else if (userType == '2') {
            return res.redirect('/supIndex?openId=' + userInfo.openId);
        } else {
            //用户为空
            console.info('用户为空');
            return res.render('admin/login');
        }
    });

}

exports.use = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, data) {
        var userType = data.userType;
        var userName = data.userName;
        if (userType == '1') {
            return res.redirect('/addResturantPage?openId=' + openId);
        } else if (userType == '2') {
            return res.redirect('/addSupplyPage?openId=' + openId);
        }
    });
}

//获取注册码
exports.sendSms = function (mobile, text) {
    http.get("http://utf8.sms.webchinese.cn/?Uid=tangmiao888888&Key=5fdc0a81395836720c50&smsMob=" + mobile + "&smsText=注册码为:" + text, function (res) {
        logger.info("send to mobile:" + mobile);
    }).on('error', function (e) {
        logger.info("error to mobile: " + e.message);
    });
}

//生成一个4位的数字的随机码
function getVerificationCode() {
    var code = '';
    for (var i = 0; i < 4; i++) {
        code += parseInt(Math.random());
    }
    return code;
}

exports.look = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, userInfo) {
        var userType = userInfo.userType;
        if (userType == '1') {//餐厅用户
            //判断餐厅机构表里面是否存在游客使用的餐厅机构
            var resturantData = {
                _id:new BSON.ObjectID('55ddcd2fa59a8ff844407ebf'),
                name: "大白菜餐厅",
                header: "大白菜",
                telephone: "18600000000",
                area: "上海",
                address: "上海市浦东新区",
                isHead: "1",
                isAvab: "true"
            };
            console.log('1001');
            mongodaDao.queryBy(resturantData, 'Restruant', function (err, data) {
                console.log('1003');
                if (!!err) {
                    console.info("数据库操作问题");
                    res.render('/500');
                } else if (!!data && data.length == 0) {
                    mongodaDao.save(resturantData, 'Restruant', function (err, data1) {
                        if (!!err) {
                            console.info("数据库操作问题");
                            res.render('/500');
                        } else if (data1.length == 0 || data1 > 1) {
                            console.info("数据库餐厅游客使用的餐厅插入出问题");
                            res.render('/500');
                        } else if (data1.length == 1) {
                            mongodaDao.update({openId: openId}, {
                                mechanism_id: data1[0]._id + '',
                                mechanism_name: data1[0].name,
                                headMechanismId: data1[0]._id + '',
                                headMechanismName: data1[0].name,
                                userAuth: '0',
                                userType: '1',
                                isConfirme: '0',
                                isGuest: '0'
                            }, 'User', function (err, user) {
                                if (!!err) {
                                    console.info("数据更新错误");
                                    return res.json({code: 500});
                                } else {
                                    //更新headMechanismId 进缓存
                                    redisDao.getInstance().hset(openId, "mechanism_id", data1[0]._id + '');
                                    redisDao.getInstance().hset(openId, "mechanism_name", data1[0].name);
                                    redisDao.getInstance().hset(openId, "headMechanismId", data1[0]._id + '');
                                    redisDao.getInstance().hset(openId, "headMechanismName", data1[0].name);
                                    redisDao.getInstance().hset(openId, "userAuth", '0');
                                    redisDao.getInstance().hset(openId, "isConfirme", '0');
                                    return res.redirect('/resIndex?openId=' + userInfo.openId);

                                }
                            });
                        }
                        //初始化模版、订单数据
                        initDataForTourist.initRestruantData(data1[0]._id.toString(),data1[0].name);
                    });
                } else if (data.length == 1) {
                    mongodaDao.update({openId: openId}, {
                        mechanism_id: data[0]._id + '',
                        mechanism_name: data[0].name,
                        headMechanismId: data[0]._id + '',
                        headMechanismName: data[0].name,
                        userAuth: '0',
                        userType: '1',
                        isConfirme: '0',
                        isGuest: '0'
                    }, 'User', function (err, user) {
                        if (!!err) {
                            console.info("数据更新错误");
                            return res.json({code: 500});
                        } else {
                            //更新headMechanismId 进缓存
                            redisDao.getInstance().hset(openId, "mechanism_id", data[0]._id + '');
                            redisDao.getInstance().hset(openId, "mechanism_name", data[0].name);
                            redisDao.getInstance().hset(openId, "headMechanismId", data[0]._id + '');
                            redisDao.getInstance().hset(openId, "headMechanismName", data[0].name);
                            redisDao.getInstance().hset(openId, "userAuth", '0');
                            redisDao.getInstance().hset(openId, "isConfirme", '0');
                            return res.redirect('/resIndex?openId=' + userInfo.openId);

                        }
                    });
                } else if (data.length > 1) {
                    console.info("数据库餐厅游客使用的餐厅插入出问题");
                    res.render('/500');
                }
            });


        } else if (userType == '2') {
            var supplyData = {
                _id:new BSON.ObjectID('55ddcd4aa59a8ff844407ecb'),
                name: "小白菜供货商",
                header: "大白菜",
                telephone: "18600000001",
                area: "上海",
                isHead: "1",
                address: "上海市浦东新区",
                isAvab: "true"
            };

            //判断供货商机构表里面是否存在游客使用的餐厅机构
            console.log('3');
            mongodaDao.queryBy(supplyData, 'Supply', function (err, data) {
                if (!!err) {
                    console.info("数据库操作问题");
                    res.render('/500');
                } else if (data.length == 0) {
                    mongodaDao.save(supplyData, 'Supply', function (err, data1) {
                        if (!!err) {
                            console.info("数据库操作问题");
                            res.render('/500');
                        } else if (data1.length == 0 || data1 > 1) {
                            console.info("数据库餐厅游客使用的餐厅插入出问题");
                            res.render('/500');
                        } else if (data1.length == 1) {
                            mongodaDao.update({openId: openId}, {
                                mechanism_id: data1[0]._id + '',
                                mechanism_name: data1[0].name,
                                headMechanismId: data1[0]._id + '',
                                headMechanismName: data1[0].name,
                                userAuth: '0',
                                userType: '2',
                                isConfirme: '0',
                                isGuest: '0'
                            }, 'User', function (err, user) {
                                if (!!err) {
                                    console.info("数据库操作问题");
                                    res.render('/500');
                                } else {
                                    //更新headMechanismId 进缓存
                                    redisDao.getInstance().hset(openId, "mechanism_id", data1[0]._id + '');
                                    redisDao.getInstance().hset(openId, "mechanism_name", data1[0].name);
                                    redisDao.getInstance().hset(openId, "headMechanismId", data1[0]._id + '');
                                    redisDao.getInstance().hset(openId, "headMechanismName", data1[0].name);
                                    redisDao.getInstance().hset(openId, "userAuth", '0');
                                    redisDao.getInstance().hset(openId, "isConfirme", '0');
                                    return res.redirect('/supIndex?openId=' + userInfo.openId);
                                }
                            });
                        }
                        //初始化模版、订单数据
                        initDataForTourist.initSupplyData(data1[0]._id.toString(),data1[0].name);
                    });
                } else if (data.length == 1) {
                    mongodaDao.update({openId: openId}, {
                        mechanism_id: data[0]._id + '',
                        mechanism_name: data[0].name,
                        headMechanismId: data[0]._id + '',
                        headMechanismName: data[0].name,
                        userAuth: '0',
                        userType: '2',
                        isConfirme: '0',
                        isGuest: '0'
                    }, 'User', function (err, user) {
                        if (!!err) {
                            console.info("数据更新错误");
                            return res.json({code: 500});
                        }else {
                            //更新headMechanismId 进缓存
                            redisDao.getInstance().hset(openId, "mechanism_id", data[0]._id + '');
                            redisDao.getInstance().hset(openId, "mechanism_name", data[0].name);
                            redisDao.getInstance().hset(openId, "headMechanismId", data[0]._id + '');
                            redisDao.getInstance().hset(openId, "headMechanismName", data[0].name);
                            redisDao.getInstance().hset(openId, "userAuth", '0');
                            redisDao.getInstance().hset(openId, "isConfirme", '0');
                            return res.redirect('/supIndex?openId=' + userInfo.openId);
                        }
                    });
                }
            });
        } else {
            //用户为空
            console.info('用户为空');
            return res.render('admin/login');
        }
    });
}

//总店添加
exports.addResturant = function (req, res) {
    var openId = getOpenId(req);
    var name = req.body.name;
    var header = req.body.header;
    var telephone = req.body.telephone;
    var area = req.body.area;
    var address = req.body.address;
    var chainStoredIds = [];
    var resturantData = {
        name: name,
        header: header,
        telephone: telephone,
        area: area,
        address: address,
        chainStoredIds: chainStoredIds,
        isHead: "1"
    };
    mongodaDao.queryBy(resturantData, 'Restruant', function (err, data1) {
        if (!!err) {
            res.json({code: 500});//系统数据库发生错误
        } else if (data1.length == 1) {
            res.json({code: 1001});//表示已经存在 不需要再次添加
        } else if (data1.length == 0) {
            mongodaDao.save(resturantData, 'Restruant', function (err, data) {
                var data = data;
                var restruantId = data[0]._id + '';
                if (!!err) {
                    logger.error('数据库操作问题');
                    return res.json({code: 103});
                } else {
                    redisDao.getInstance().hset(openId, "mechanism_id", restruantId);
                    redisDao.getInstance().hset(openId, "mechanism_name", name ? name : '');
                    redisDao.getInstance().hset(openId, "userAuth", '1');
                    redisDao.getInstance().hgetall(openId, function (err, data1) {
                        var userType = data1.userType;
                        var userName = data1.userName;
                        //console.info('res supplyId:' + supplyId);
                        //console.info('res userType:' + data1.userType);
                        //console.info('res mechanism_id:' + restruantId);
                        //更新headMechanismId 总店id
                        mongodaDao.updateOrSave({userName: userName}, {
                            mechanism_id: restruantId,
                            mechanism_name: name,
                            headMechanismId: restruantId,
                            headMechanismName: name,
                            userAuth: '1',
                            isConfirme: '1',
                            isGuest: '1',
                            userType: '1'
                        }, 'User', function (err, user) {
                            if (!!err) {
                                console.info("数据更新错误");
                                return res.json({code: 500});
                            } else {
                                //更新headMechanismId 进缓存
                                redisDao.getInstance().hset(openId, "headMechanismId", restruantId);
                                redisDao.getInstance().hset(openId, "headMechanismName", name ? name : '');
                                redisDao.getInstance().hset(openId, "isGuest", '1');
                                redisDao.getInstance().hset(openId, "userType", '1');
                                redisDao.getInstance().hset(openId, "isConfirme", '1');
                                redisDao.getInstance().hset(openId, "userAuth", '1');
                                return res.json({code: 101, mId: restruantId});
                            }
                        });
                    });
                }
            });
        }
    });
}

//分店添加,新增的分店，会新增一条Restruant纪录，同时更新总店里面的chainStoredIds 字段
exports.addChainRest = function (req, res) {
    var openId = getOpenId(req);
    var name = req.body.name;
    var header = req.body.header;
    var telephone = req.body.telephone;
    var address = req.body.address;
    var area = req.body.area;
    var chainStoredIds = [];
    var resturantData = {
        name: name,
        header: header,
        telephone: telephone,
        address: address,
        area: area,
        chainStoredIds: chainStoredIds,
        isHead: "0"
    };
    //总店id
    redisDao.getInstance().hgetall(openId, function (err, data1) {
        var mId = data1.mechanism_id;
        if (mId) {
            mongodaDao.queryBy({_id: new BSON.ObjectID(mId)}, "Restruant", function (err, rest) {
                if (err) return res.json({code: 500})
                if (rest && rest.length == 1) {
                    var chainStoredIds = rest[0].chainStoredIds;
                    if (!chainStoredIds) {
                        chainStoredIds = [];
                    }
                    mongodaDao.save(resturantData, 'Restruant', function (err, data) {
                        if (err) return res.json({code: 500});
                        if (data && data.length == 1) {
                            chainStoredIds.push(data[0]._id + '');
                            mongodaDao.update({_id: new BSON.ObjectID(mId)}, {chainStoredIds: chainStoredIds}, 'Restruant', function (err, r) {
                                if (err) return res.json({code: 500});
                                res.json({code: 100});
                            });
                        }
                    });
                } else {
                    //没有该数据
                    return res.json({code: 102});
                }
            });
        } else {
            //没有该数据
            return res.json({code: 102});
        }
    });

    //if (mId) {
    //    mongodaDao.queryBy({ _id: new BSON.ObjectID(mId) }, "Restruant", function (err, rest) {
    //        if (err) return res.json({ code: 500 });
    //        if (rest && rest.length == 1) {
    //            var chainStoredIds = rest.chainStoredIds;
    //            mongodaDao.save(resturantData, 'Restruant', function (err, data) {
    //                if (err) return res.json({ code: 500 });
    //                if (data && data.length == 1) {
    //                    if(!chainStoredIds){
    //                        chainStoredIds = []
    //                    }
    //                    chainStoredIds.push(data[0]._id + '');
    //                    mongodaDao.update({ _id: new BSON.ObjectID(mId) }, { chainStoredIds: chainStoredIds }, 'Restruant', function (err, r) {
    //                        if (err) return res.json({ code: 500 });
    //                        res.json({ code: 100 });
    //                    });
    //                }
    //            });
    //        } else {
    //            //没有该数据
    //            return res.json({ code: 102 });
    //        }
    //    });
    //} else {
    //    //没有该数据
    //    return res.json({ code: 102 });
    //}
}

exports.addSupply = function (req, res) {
    var openId = getOpenId(req);
    var name = req.body.name;
    var header = req.body.header;
    var telephone = req.body.telephone;
    var area = req.body.area;
    var address = req.body.address;
    var supplyData = {name: name, header: header, telephone: telephone, area: area, address: address};
    mongodaDao.queryBy(supplyData, 'Supply', function (err, data1) {
        if (!!err) {
            console.info('数据库操作问题');
            res.json({code: 500});
        } else if (data1.length == 0) {
            mongodaDao.save(supplyData, 'Supply', function (err, data) {
                var data = data;
                var supplyId = data[0]._id + '';
                if (!!err) {
                    logger.error('数据库操作问题');
                    return res.json({code: 500});
                } else {
                    redisDao.getInstance().hset(openId, "mechanism_id", supplyId);
                    redisDao.getInstance().hset(openId, "mechanism_name", name ? name : '');
                    redisDao.getInstance().hset(openId, "userAuth", '1');
                    redisDao.getInstance().hgetall(openId, function (err, data1) {
                        var userType = data1.userType;
                        var userName = data1.userName;
                        //console.info('supply supplyId:' + supplyId);
                        //console.info('supply userType:' + data1.userType);
                        //console.info('supply mechanism_id:' + supplyId);
                        mongodaDao.updateOrSave({userName: userName}, {
                            mechanism_id: supplyId,
                            mechanism_name: name,
                            headMechanismId: supplyId,
                            headMechanismName: name,
                            userAuth: '1',
                            isConfirme: '1',
                            isGuest: '1',
                            userType: '2'
                        }, 'User', function (err, user) {
                            if (!!err) {
                                console.info("数据库操作问题");
                                return res.json({code: 500});
                            } else {
                                redisDao.getInstance().hset(openId, "headMechanismId", supplyId);
                                redisDao.getInstance().hset(openId, "headMechanismName", name ? name : '');
                                redisDao.getInstance().hset(openId, "isGuest", '1');
                                redisDao.getInstance().hset(openId, "userType", '2');
                                redisDao.getInstance().hset(openId, "isConfirme", '1');
                                redisDao.getInstance().hset(openId, "userAuth", '1');
                                return res.json({code: 101});
                            }
                        });

                    });
                }
            });
        } else if (data1.length > 0 && data1.length < 2) {
            res.json({code: 102});
        } else {
            console.log('数据库供货商出现一个用户但在供货商数据表中对应多条数据 openId:' + openId);
        }
    });
}

exports.addResturantPage = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, userInfo) {
        if (userInfo) {
            res.render('admin/addRestaurant', {openId: userInfo.openId});
        } else {
            console.info('当前userInfo信息为空,请坚持.');
            res.render('500');
        }
    });
}


exports.addChainRestaurantPage = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, userInfo) {
        if (userInfo) {
            res.render('admin/addChainRestaurant', {openId: userInfo.openId});
        } else {
            console.info('当前userInfo信息为空,请坚持.');
            res.render('500');
        }
    });
}


exports.addSupplypage = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, userInfo) {
        if (userInfo) {
            res.render('admin/addSupply', {openId: userInfo.openId});
        } else {
            console.info('当前userInfo信息为空,请坚持.');
            res.render('500');
        }
    });
}

var checkCode = "";
exports.getCheckCode = function (req, res) {
    var mPhoneNumber = req.body.mPhoneNumber;
    var checkCode = getVerificationCode();
    http.get("http://utf8.sms.webchinese.cn/?Uid=tangmiao888888&Key=5fdc0a81395836720c50&smsMob=" + mPhoneNumber + "&smsText=注册码为:" + checkCode, function (res) {
        logger.info("send to mobile:" + mobile);
    }).on('error', function (e) {
        logger.info("error to mobile: " + e.message);
    });

}

exports.nextstep = function (req, res) {
    res.render('admin/index');
}

exports.create = function (req, res) {
    var openId = getOpenId(req);
    redisDao.getInstance().hgetall(openId, function (err, data) {
        var userType = data.userType;
        var userName = data.userName;
        if (userType == 1) {
            return res.render('admin/addRestaurant', {openId: openId});
        } else if (userType == 2) {
            return res.render('admin/addSupply', {openId: openId});
        }

    });
}


/**
 * 联系我们
 * @param req
 * @param res
 */
exports.contactUs = function (req, res) {
    res.render('restaurant/my/contactUs', {title: "联系我们"});
}

//首次登录，要求用户修改名字
exports.loginModifyNamePage = function (req, res) {
    res.render('admin/modifyName', {title: "修改名字", openId: '12312312312'});
}

//第一次登陆修改登录用户名
exports.loginModifyName = function (req, res) {
    var name = req.query.userName;
    var openId = req.query.openId;

    mongodaDao.update({openId: openId}, {userName: name}, 'User', function (err, data) {
        if (err) return res.render('/500');
        mongodaDao.queryBy({openId: openId}, "User", function (err, user) {
            if (err) return res.render('/500');
            if (user[0].mechanism_id) {
                redisDao.getInstance().hset(openId, "id", user[0]._id);
                redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                redisDao.getInstance().hset(openId, "mechanism_id", user[0].mechanism_id ? user[0].mechanism_id : '');
                redisDao.getInstance().hset(openId, "mechanism_name", user[0].mechanism_name ? user[0].mechanism_name : '');
                redisDao.getInstance().hset(openId, "userType", user[0].userType ? user[0].userType : '');
                redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                redisDao.getInstance().hset(openId, "openId", user[0].openId);
                redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                redisDao.getInstance().hset(openId, "headMechanismId", user[0].headMechanismId ? user[0].headMechanismId : '');
                redisDao.getInstance().expire(openId, 36000); // 10 hours
                if (user[0].userType == '1') {
                    return res.redirect('/resIndex?openId=' + openId);
                } else if (user[0].userType == '2') {
                    return res.redirect('/supIndex?openId=' + openId);
                }
            } else {
                redisDao.getInstance().hset(openId, "id", user[0]._id);
                redisDao.getInstance().hset(openId, "userName", user[0].userName ? user[0].userName : '');
                redisDao.getInstance().hset(openId, "mechanism_id", '');
                redisDao.getInstance().hset(openId, "mechanism_name", '');
                redisDao.getInstance().hset(openId, "userType", user[0].userType ? user[0].userType : '');
                redisDao.getInstance().hset(openId, "userAuth", user[0].userAuth ? user[0].userAuth : '');
                redisDao.getInstance().hset(openId, "openId", user[0].openId);
                redisDao.getInstance().hset(openId, "isConfirme", user[0].isConfirme ? user[0].isConfirme : '');
                return res.render('admin/choose', {openId: openId});
            }

        });
    });
}

exports.registerText = function (req, res) {
    var openId = 'ouYGlt4ptWL9nzgbyVP7sZ7K-s_k'
    var userType = '1';
    res.render('admin/register', {openId: openId, userType: userType});

}


//更该组员禁用状态
exports.updateUserIsAvb = function (req, res) {
    var userId = req.body.id;
    var isAvab = req.body.type;
    console.info('userId' + userId + 'isAvab:' + isAvab);
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({code: 500, errmsg: '系统出错'});
        } else {
            var userAuth = userInfo.userAuth;
            //判断当前操作人员是否为管理员
            if (userAuth === '1') {
                mongodaDao.update({_id: new BSON.ObjectID(userId)}, {isAvab: isAvab}, 'User', function (err, result) {

                    if (err) {
                        console.log('系统错误');
                        return res.json({code: 500, errmsg: '系统错误'});
                    } else if (!result) {
                        console.log('更改用户使用状态失败！');
                        return res.json({code: 500, errmsg: '操作失败！'});
                    } else if (result == 1) {
                        //刷新该用户的缓存信息
                        mongodaDao.findById(userId, 'User', function (err, user) {
                            if (user) {
                                var openId = user.openId;
                                redisDao.getInstance().del(openId);
                                return res.json({code: 100});
                            }
                        });


                    }
                });
            } else {
                return res.json({code: 500, errmsg: '当前用户没有权限'});
            }
        }

    });

}

//判断用户或者用户所属餐厅是否被禁用
function isAvabByUser(req, res, isAvab, headMechanismId, mechanism_id, type) {
    return Q.Promise(function (resolve, reject) {
        console.info('----isAvab:' + isAvab);
        //判断用户是否被禁用
        if (isAvab === 'false') {
            return res.render('admin/remind', {msg: '该用户已被禁用，不能登录系统！'});
        } else {
            //判断用户所属餐厅是否被禁用
            if (type === '1') {
                Q.all([Q.nfcall(mongodaDao.queryBy, {
                    _id: new BSON.ObjectID(mechanism_id),
                    isAvab: 'false'
                }, 'Restruant'),
                    Q.nfcall(mongodaDao.queryBy, {
                        _id: new BSON.ObjectID(headMechanismId),
                        isAvab: 'false'
                    }, 'Restruant')]).then(function (results) {
                    if (!results) {
                        return reject({code: 500, msg: '系统错误'});
                    } else {
                        if (results[0].length > 0) {
                            return res.render('admin/remind', {msg: '所属餐厅已被禁用，不能登录系统！'});
                        }
                        if (results[1].length > 0) {
                            return res.render('admin/remind', {msg: '总餐厅已被禁用，不能登录系统！'});
                        }
                        return resolve({code: 100});
                    }
                });
            } else {
                Q.all([Q.nfcall(mongodaDao.queryBy, {_id: new BSON.ObjectID(mechanism_id), isAvab: 'false'}, 'Supply'),
                    Q.nfcall(mongodaDao.queryBy, {
                        _id: new BSON.ObjectID(headMechanismId),
                        isAvab: 'false'
                    }, 'Supply')]).then(function (results) {
                    if (!results) {
                        return reject({code: 500, msg: '系统错误'});
                    } else {
                        if (results[0].length > 0) {
                            return res.render('admin/remind', {msg: '所属餐厅已被禁用，不能登录系统！'});
                        }
                        if (results[1].length > 0) {
                            return res.render('admin/remind', {msg: '总餐厅已被禁用，不能登录系统！'});
                        }
                        return resolve({code: 100});
                    }
                });
            }
        }
    });
}

