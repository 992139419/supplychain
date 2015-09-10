/**
 * Created by tangnian on 14/11/10.
 */
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Server = require('./server/server');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var compress = require('compression');
var config = require('./config');
var path = require('path');
var redisStore = require('connect-redis')(session);
var logger = require('./server/log/logFactory').getLogger();
var http = require('http');
var app = express()
var wechat = require('wechat');
var url = require('url');
var weixinService = require('./server/models/weixinService');
var mongodaDao = require('./server/storage/mongodbDao');
var sessionMiddleware = session({
    secret: 'hades',
    resave: false,
    saveUninitialized: true,
    store: new redisStore({
        host: config.redishost,
        port: config.redisport
    })
});
var ejs = require('ejs');
app.use(express.static(__dirname + '/public')); //方便开发，暂时引入
// App 全局配置
app.use(cookieParser());
app.use(sessionMiddleware);
//app.use(authority.getVisitInfo);//分辨请求来源
//app.use(authority.check);//请求权限验证
weixinService.getAccess_token();
app.use('/weixin', wechat("token2015", function (req, res, next) {
    // 微信输入信息都在req.//test by osy2333
    var message = req.weixin;
    var openId = message.FromUserName;
    var pathname = url.parse(req.url).pathname;  //pathname => select
    var arg = url.parse(req.url).query;          //arg => name=a&id=5
    if ((message.MsgType == 'event') && (message.Event == 'subscribe')) {
        var replyStr = "大白菜食材供应平台感谢你的关注";
        console.log("你已经关注了该微信号");
        mongodaDao.queryBy({openId: openId}, 'User', function (err, data) {
            if (!!err) {
                console.log("数据库操作错误");
            } else if (data.length == 0) {
                mongodaDao.save({openId: openId, status: "1"}, 'User', function (err, data) {
                    if (!!err) {
                        console.log("数据库操作错误");
                    } else if (!data) {
                        console.log("首次关注数据库操作错误");
                    } else {
                        console.log("首次关注成功，,openId为:" + openId);
                    }
                });
            } else if (data.length == 1) {
                mongodaDao.update({openId: openId, status: "0"}, {
                    openId: openId,
                    status: '1'
                }, 'User', function (err, data) {
                    if (!!err) {
                        console.log("数据库操作错误");
                    } else if (!data || data != 1) {
                        console.log("更新再次关注用户状态操作错误");
                    }
                    else {
                        console.log('再次关注成功,openId为:' + openId);
                    }
                });
                res.reply(replyStr);
            } else if (data.length > 1) {
                console.log("数据库里面多余的数据，可能是该用户在没有关注这个微信号的是时候 openId已经存在数据库里面");
            }
        });

    } else if ((message.MsgType == 'event') && (message.Event == 'unsubscribe')) {
        mongodaDao.queryBy({openId: openId, status: "1"}, 'User', function (err, data) {
            if (!!err) {
                console.log("数据库操作错误");
            } else if (!data) {
                console.log("数据库操作错误");
            } else if (data.length === 0) {
                console.log('数据库操作有误，openI为：' + openId + '得用户取消关注时，数据库没有该用户的数据');
            } else if (data.length === 1) {
                mongodaDao.update({openId: openId}, {status: "0"}, 'User', function (err, data) {
                    if (!!err) {
                        console.log("数据库操作错误");
                    } else if (!data) {
                        console.log("数据库操作错误");
                    } else if (data === 1) {
                        console.log("已经取消关注了");
                    } else {
                        console.log("取消关注，更新数据库失败！");
                    }
                });
            } else if (data.length > 1) {
                console.log("openId为:" + openId + "的用户取消关注时，数据库里存在多条用户信息");
            }
        });
    } else if (message.MsgType == 'text') {
        var input = (message.Content || '').trim();
        if (input === '你好') {
            res.reply('你好');
        } else {
            res.reply('欢迎来到餐购系统,目前测试阶段,用户体验并不是很流畅,请多多包涵,提意见.');
        }
    }
}));

app.use(compress());//GZIP压缩
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
//app.use(authority.setOpenId);//强行让SESSIONID赋值为OPENID
app.set('views', __dirname + '/server/view'); // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
//注入URL
require('./server/controllers/routes')(app);
var appServer = new Server(app);
//if (cluster.isMaster) {
//    for (var i = 0; i < numCPUs; i++) {
//        //轮询策略
//        cluster.schedulingPolicy = cluster.SCHED_RR;
//        var workThread = cluster.fork();
//        console.info("start a new worker thread [" + workThread.process.pid + "]");
//    }
//} else {
    appServer.start();
//}