/**
 * Created by tangnian on 14/11/19.
 * terminalType 0: PC; 1: mobile
 * sourceType 0: mobile browser; 1:mobile APP
 */
var redisDao = require('../storage/redisDao');
var underscore = require('underscore');
var __string = require('underscore.string');
var util = require('util');
var logger = require('../log/logFactory').getLogger();
var urls = [];

exports.isLogin = function (req, res) {
    var sessionId = req.sessionID;
    if (__string.isBlank(sessionId)) {
        res.ajax({error: 'no session ID'});
    }
    var _logonFlag = false;
    // 100: 未登录
    // 101: 登陆成功
    redisDao.getInstance().hgetall(sessionId, function (err, replies) {
        logger.info("replies", replies); // nickname, uId, loginAt
        if (err) {
            logger.error('isLogin(sessionId) - error', err);
            _logonFlag = false;
        } else if (!replies) {
            _logonFlag = false;
        } else {
            _logonFlag = true;
        }
        if (!_logonFlag) {
            res.json({status: 100, message: 'no'});
        } else {
            res.json({status: 101, message: 'yes', nickname: replies.nickname});
        }
    });
}

//验证登陆权限
exports.check = function (req, res, next) {
    var path = req.path;
    //请求的地址如果在URLS里面，则表示需要验证权限，不然就直接通过；
    if (underscore.contains(urls, path)) {
        if (req.sourceType == 1) {
            var sessionId = req.query.sessionId;
        } else {
            var sessionId = req.sessionID;
        }
        redisDao.getInstance().hget(sessionId, "loginAt", function (err, replies) {
            if (err) {
                logger.error('entitle validation: path', err);
                res.render("500");
            } else if (!replies) {
                //mobile
                res.render("user/login");
            } else {
                next();
            }
        });
    } else {
        next();
    }
};

//URL权限设定
exports.urlAuthoritySet = function (req, res) {
    var paths = [];
    paths.push('/');
};

//验证登陆权限
exports.demo = function (req, res) {
    logger.info("req:" + req.params.tId);
};

//访问信息
var terminal = ['Macintosh', 'Windows', 'iPhone', 'Linux'];
var source = 'Html5Plus/1.0';
exports.getVisitInfo = function (req, res, next) {
    var agent = req.header('user-agent'), lowerAgent = '';
    //0:PC,1:移动
    var terminalType = 1;
    if (agent) {
        for (var i = 0; i < 2; i++) {
            if (agent.indexOf(terminal[i]) > -1) {
                terminalType = 0;
                break;
            }
        }
        if (agent.indexOf(source) > -1) {
            req.sourceType = 1;
        } else {
            req.sourceType = 0;
        }
        // 判断是否在微信中打开 START
        lowerAgent = agent.toLowerCase();
        if (/micromessenger/.test(lowerAgent)) {
            req.weiXin = 1;
        } else {
            req.weiXin = 0;
        }
        // 判断是否在微信中打开 END
    }
    req.terminalType = terminalType;
    next();
};

////只有微信过来的请求才有效果
//exports.setOpenId = function (req, res, next) {
//    console.info('query:'+req.query);
//    console.info('body:'+req.body);
//    if (req.query && req.query.openId) {
//        req.openId = req.query.openId;
//    } else if (req.body && req.body.openId) {
//        req.openId = req.body.openId;
//    }
//    next();
//}