//餐厅部分服务

var config = require('../../config');
var mongodbDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var underscore = require('underscore');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();
var userPromise = require('./userService').userPromise;
var getOpenId = require('./userService').getOpenId;
var template = require('./restaurant/templateService');
var _ = require('underscore');
var request = require('request');
var commonService = require('./commonService');
var ObjectID = require('mongodb').ObjectID;
var geocodingApi = require('./geocodingApi');

exports.testSlack = function (req, res) {
    var data = {
        "channel": "#wxrestaurant",
        "username": "webhookbot",
        "text": "This is posted to #wxrestaurant and comes from a bot named webhookbot.",
        "icon_emoji": ":ghost:"
    };
    request.post({
        url: 'https://hooks.slack.com/services/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',
        form: JSON.stringify(data)
    }, function (error, response, body) {
        console.info('error', error);
        console.info('response', response);
        console.info('body', body);
    });
}

exports.resIndex = function (req, res) {
    var id = req.query.categoryId;
    var qNumPage = req.query.numPage, qPageIdx = req.query.pageIdx;
    var queryArrary = [];
    var _numberPage = 15, _skipIdx, _lastIdx, //默认每页显示五条，从第一页开始显示
        pageIdx = 1;
    if (qNumPage) {

        _numberPage = qNumPage;
    }
    if (qPageIdx) {
        pageIdx = qPageIdx;
    }
    _skipIdx = _numberPage * (pageIdx - 1);
    _lastIdx = _numberPage * pageIdx;
    var materialFromMoArr = [];
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var searchMe = {}
            if (id && id != 0 && id != 'no') {     //判断是否需要根据类别去查询菜品。no为不需要引入头部文件的首页

                searchMe = {categoryId: id};
            }
            return Q.all([Q.nfcall(mongodbDao.queryAdv, 'Category', {}, {}, {seqNo: 1}),
                Q.nfcall(mongodbDao.pagingQuery, searchMe, "Material", {supplyNum: -1}, _skipIdx, _lastIdx),
                Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(userInfo.id)}, "User"),//查询用户,
                Q.nfcall(mongodbDao.queryBy, {restruant_id: userInfo.mechanism_id}, "InquerySheet")])//查询餐厅;//
        }
    }).then(function (feed) {
        var followMaList = [], requiredMalist = [], allMetrials = feed[1], requiredForM = [], followedMFM = [];
        if (feed[3][0]) {
            requiredForM = feed[3][0].materials;
        }
        if (feed[2][0]) {
            followedMFM = feed[2][0].favMetrial;
        }
        for (var i = 0; i < allMetrials.length; i++) {
            var material = allMetrials[i];
            //获取必备食材//
            if (requiredForM) {
                for (var j = 0; j < requiredForM.length; j++) {
                    if (material._id.toString() == requiredForM[j].material_id) {
                        requiredMalist.push(material);
                    }
                }
            }
            //end
            //获取关注食材//
            //console.info(JSON.stringify(followMaList));
            if (followedMFM) {
                for (var j = 0; j < followedMFM.length; j++) {
                    if (material._id.toString() == followedMFM[j].toString()) {
                        followMaList.push(material);
                    }
                }

            }
        }
        if (id && id != 'no') { //加载选定类别的产品
            res.json({category: feed[0], materials: feed[1], requiredMa: requiredMalist, followedMa: followMaList})
        } else if (id == 'no') {
            res.render('restaurant/index', {
                title: "首页",
                category: feed[0],
                materials: feed[1],
                requiredMa: requiredMalist,
                followedMa: followMaList,
                openId: getOpenId(req)
            });
        } else {
            res.render('restaurant/template/pageLayout', {
                title: "首页",
                category: feed[0],
                materials: feed[1],
                requiredMa: requiredMalist,
                followedMa: followMaList,
                openId: getOpenId(req)
            });
        }
    });
}

exports.indexTab1 = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            return res.render('restaurant/index_tab1', {title: "首页"});
        }
    });
}

exports.indexTab2 = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            return res.render('restaurant/index_tab2', {title: "首页"});
        }
    });
}


//我的
exports.jumpddMyPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            res.render('restaurant/my/my', {title: "我的", userAuth: userInfo.userAuth})
        }
    });
}

/**
 * 新建询价单选择页面跳转
 * @param req
 * @param res
 */
exports.choose = function (req, res) {
    res.render('restaurant/addIqrySheetchoose', {title: '新建询价单'});
}

/**
 * 我的订单页面
 *
 *
 */
exports.myOrders = function (req, res) {
    var anchor = req.query.anchor;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            //var orderCreator = req.query.creator; //订单创建者。仅供开发阶段测试，真实情况，默认是查询登陆用户的订单。
            //根据登陆用户的id去查询该餐厅所有订单
            var mechanismId = userInfo.mechanism_id;
            var array = new Array();
            mongodbDao.findById(mechanismId, 'Restruant', function (err, restruant) {
                if (restruant && restruant.isHead == '1') {
                    array.push(mechanismId);
                    if (restruant.chainStoredIds) {
                        array = _.union(array, restruant.chainStoredIds);
                    }
                } else {
                    array.push(mechanismId);
                }

                var order = {restruantId: {$in: array}};

                mongodbDao.queryBy(order, 'Orders', function (err, feed) {
                    if (err) {
                        console.log(err);
                    } else {

                        var sendOrders = [], deliveryOrders = [], receivedOrders = [], pendingOrder = [];

                        for (var i = 0; i < feed.length; i++) {

                            var order = feed[i];
                            //格式化日期
                            order.createdAt = commonUtil.formatDate(order.createdAt, 'yyyy-M-d h:m:s');

                            if (order.orderStatus == 'N') {//new
                                sendOrders.push(order); // 新下单，
                            }
                            if (order.orderStatus == 'S') {  //配送中
                                deliveryOrders.push(order); //
                            }

                            if (order.orderStatus == 'P') {   //等待付款
                                pendingOrder.push(order); //
                            }


                            if (order.orderStatus == 'R') {   //已验收
                                receivedOrders.push(order); //
                            }
                        }

                        anchor = anchor ? anchor : '0'
                        res.render("restaurant/my/my_order_list", {
                            sendOrder: sendOrders,
                            deliveryOrders: deliveryOrders,
                            receivedOrders: receivedOrders,
                            pendingOrders: pendingOrder,
                            title: '我的订单',
                            userType: userInfo.userType,
                            openId: userInfo.openId,
                            anchor: anchor
                        });
                    }
                });
            });
        }
    });
}


exports.getOrderById = function (req, res) {
    var isHead = req.query.isHead ? req.query.isHead : 'false';
    var openId = req.query.openId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var orderId = req.query.ordId;
            //orderId = parseInt(orderId);
            var orderSearch = {_id: BSON.ObjectID(orderId)};
            mongodbDao.queryBy(orderSearch, 'Orders', function (err, feed) {
                if (err) {
                    console.log(err);
                } else {
                    if (userInfo.userType == '2') { //如果是供应商
                        if (feed[0].orderStatus == 'N') {
                            return res.render("supply/template/preparingSending", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        } else if (feed[0].orderStatus == 'R') {
                            res.render("restaurant/list_detalis_sampled", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        }
                        else {
                            res.render("restaurant/list_detalis", {ordersDetail: feed, isHead: isHead, openId: openId});
                        }
                    } else {
                        if (feed[0].orderStatus == 'S') {//已经配送
                            res.render("restaurant/template/confirmeReceived", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            }); //跳转到确认收货页面
                        } else if (feed[0].orderStatus == 'R') {
                            res.render("restaurant/list_detalis_sampled", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        } else if (feed[0].orderStatus == 'P') {

                            res.render("restaurant/inqueySheet/pedingOrder", {
                                ordersDetail: JSON.stringify(feed[0]),
                                isHead: isHead,
                                openId: openId
                            });
                        }
                        else {
                            res.render("restaurant/list_detalis", {ordersDetail: feed, isHead: isHead, openId: openId});
                        }
                    }
                }
            });
        }
    });
}

/**
 * 关注／取消 食材
 * @param req
 * @param res
 */
exports.setFavMaterial = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var id = req.query.id;
            mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    //### 测试需要 开始
                    //users = [];
                    //var u = {};
                    //u.favMetrial = [];
                    //u.favMetrial.push('556c2c8770f6ffd547113a98');
                    //u.favMetrial.push('556c7748e4cb2a56570360bc');
                    //u.favMetrial.push('556c775ee4cb2a56570360bd');
                    //users.push(u);
                    //### 测试需要 结束
                    var user = users[0];
                    if (!user.favMetrial) {
                        user.favMetrial = [];
                        //加入
                        user.favMetrial.push(id);
                    } else {
                        var index = _.indexOf(user.favMetrial, id);
                        //没有，则加入
                        if (index == -1) {
                            user.favMetrial.push(id);
                        } else {
                            //有，则取消
                            user.favMetrial.splice(index, 1);
                        }
                    }
                    mongodbDao.update({userName: userInfo.userName}, {favMetrial: user.favMetrial}, 'User', function (err, u) {
                        if (!err) {
                            return res.json({status: 500});
                        } else {
                            return res.json({status: 100});
                        }
                    });
                }
            });
        }
    });
}

/**
 * 我的关注列表 食材主页
 * @param req
 * @param res
 */
exports.getFavMaterial = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    //### 测试需要 开始
                    //users = [];
                    //var u = {};
                    //u.favMetrial = [];
                    //u.favMetrial.push('556c2c8770f6ffd547113a98');
                    //u.favMetrial.push('556c7748e4cb2a56570360bc');
                    //u.favMetrial.push('556c775ee4cb2a56570360bd');
                    //users.push(u);
                    //### 测试需要 结束
                    if (users.length > 0) {
                        var favMaterial = users[0].favMetrial;
                        if (!favMaterial) favMaterial = [];
                        var queryArray = [];
                        for (var i = 0; i < favMaterial.length; i++) {
                            queryArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(favMaterial[i])}, 'Material'));
                        }
                        Q.all(queryArray).then(function (success) {
                            var materials = [];
                            for (var i = 0; i < success.length; i++) {
                                if (success[i][0]) {
                                    materials.push(success[i][0]);
                                }
                            }
                            return res.render('restaurant/my/favMaterials', {materials: materials, title: '关注的食材'});
                        });
                    } else {
                        return res.render('restaurant/my/favMaterials', {materials: [], title: '关注的食材'})
                    }
                }
            });
        }
    });
}

/**
 * 关注／取消 供应
 * @param req
 * @param res
 */
exports.setFavSupply = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var id = req.query.id;
            mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    //### 测试需要 开始
                    //users = [];
                    //var u = {};
                    //u.favMetrial = [];
                    //u.favMetrial.push('556c2c8770f6ffd547113a98');
                    //u.favMetrial.push('556c7748e4cb2a56570360bc');
                    //u.favMetrial.push('556c775ee4cb2a56570360bd');
                    //users.push(u);
                    //### 测试需要 结束
                    var user = users[0];
                    if (!user.favSupply) {
                        user.favSupply = [];
                        //加入
                        user.favSupply.push(id);
                    } else {
                        var index = _.indexOf(user.favSupply, id);
                        //没有，则加入
                        if (index == -1) {
                            user.favSupply.push(id);
                        } else {
                            //有，则取消
                            user.favSupply.splice(index, 1);
                        }
                    }
                    mongodbDao.update({userName: userInfo.userName}, {favSupply: user.favSupply}, 'User', function (err, u) {
                        if (!err) {
                            return res.json({status: 500});
                        } else {
                            return res.json({status: 100});
                        }
                    });
                }
            });
        }
    });
}

/**
 * 我的关注列表 供应商
 * @param req
 * @param res
 */
exports.getFavSupply = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    //### 测试需要 开始
                    //users = [];
                    //var u = {};
                    //u.favSupply = [];
                    //u.favSupply.push('556c2c8770f6ffd547113a98');
                    //u.favSupply.push('556c7748e4cb2a56570360bc');
                    //u.favSupply.push('556c775ee4cb2a56570360bd');
                    //users.push(u);
                    //### 测试需要 结束
                    if (users.length > 0) {
                        var favSupply = users[0].favSupply;
                        if (!favSupply) favSupply = [];
                        var queryArray = [];
                        for (var i = 0; i < favSupply.length; i++) {
                            queryArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(favSupply[i])}, 'Supply'));
                        }
                        Q.all(queryArray).then(function (success) {
                            var supplys = [];
                            for (var i = 0; i < success.length; i++) {
                                if (success[i][0]) {
                                    supplys.push(success[i][0]);
                                }
                            }
                            return res.render('restaurant/my/favSupply', {supplys: supplys, title: '关注的供应商'});
                        });

                    } else {
                        return res.render('restaurant/my/favSupply', {supplys: [], title: '关注的供应商'});
                    }
                }
            });
        }
    });
}


/**
 * 保存评论
 * @param req
 * @param res
 */
exports.saveComments = function (req, res) {

    var oId = req.query.id; //获取到order的内置订单id
    var _addComments = req.query.comments; //获取到用户评论。
    var Order = {comments: _addComments};
    var search = {};
    if (oId.length === 24) {
        search = {
            _id: ObjectID.createFromHexString(oId.toString())
        }
    }
    mongodbDao.update(search, Order, "Orders", function (err, feed) {
        if (err) {
            console.log(err);
        }
        if (feed > 0) {
            return res.json(feed);
        }
    });
}

/**
 * 评论页面
 * @param req
 * @param res
 */
exports.addComments = function (req, res) {
    var oId = req.query.id;
    res.render('restaurant/add_comment', {title: "评论页面", id: oId});
}


/**
 * 价格走势
 * @param req
 * @param res
 */
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d;
}
function chaxun(a) {
    return Q.nfcall(mongodbDao.queryBy, a, 'SpiderData');
}
exports.viewMaterialPT = function (req, res) {
    var id = req.query.id;

    mongodbDao.queryBy({_id: new BSON.ObjectID(id)}, 'Material', function (err, data) {
        if (data[0]) {
            var name = data[0].name
            var mall = []
            for (var a = 0; a < 7; a++) {
                var star = a - 6;
                var end = a - 5;
                var startDate = GetDateStr(star)
                var endDate = GetDateStr(end);
                var condition = {
                    time: {$gt: new Date(startDate), $lte: new Date(endDate)},
                    name: "大米"
                }
                mall.push(chaxun(condition))

            }
            var jhjh = []
            Q.all(mall).done(function (data) {
                for (var aq = 0; aq < data.length; aq++) {
                    var fg = 0;
                    for (var bq = 0; bq < data[aq].length; bq++) {
                        fg += data[aq][bq].price
                    }
                    var df = fg / data[aq].length;
                    jhjh.push(df)
                }
                //jhjh = '10,01,10,10,10,10,10'
                res.render('restaurant/my/viewMaterialPT', {title: "价格走势", price: jhjh});
            })
        }
    })


}


/**
 * 我的供应商－－常用联系人
 * @param req
 * @param res
 */
exports.resContacts = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({mechanism_id: userInfo.headMechanismId}, 'FrequentContacts', function (err, data) {

                if (err) {
                    return res.json({status: 500});
                } else {
                    if (data.length > 0) {
                        var contacts = data[0].contacts;
                        var _startIdx = req.query.startIdx, _currentIdx;
                        if (!_startIdx) {
                            _startIdx = 0;
                        } else {
                            _startIdx = parseInt(_startIdx);
                        }
                        _currentIdx = parseInt(_startIdx / 10 + 1);
                        var queryArray = [];
                        for (; _startIdx < contacts.length && _startIdx < (_startIdx + 10); _startIdx++) {
                            if (contacts[_startIdx]) {
                                queryArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(contacts[_startIdx])}, 'Supply'));
                            }
                        }
                        Q.all(queryArray).then(function (success) {

                            res.render('restaurant/my/contacts', {
                                title: "常联系人",
                                contacts: success,
                                _currentIdx: _currentIdx,
                                userType: userInfo.userType
                            });
                        });
                    } else {
                        return res.render('restaurant/my/contacts', {title: "常联系人", contacts: []});
                    }
                }
            });
        }
    });
}

/**
 * 我的供应商－－常用联系人 删除
 * @param req
 * @param res
 */
exports.resDelContacts = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({mechanism_id: userInfo.headMechanismId}, 'FrequentContacts', function (err, data) {
                console.info(JSON.stringify(data));
                if (err) {
                    return res.json({status: 500});
                } else {
                    var id = req.query.id;
                    var contacts = data[0].contacts;
                    if (!contacts) {
                        contacts = [];
                        //加入
                        contacts.push(id);
                    } else {
                        var index = _.indexOf(contacts, id);
                        //没有，则加入
                        if (index == -1) {
                            contacts.push(id);
                        } else {
                            //有，则取消
                            contacts.splice(index, 1);
                        }
                    }
                    mongodbDao.update({mechanism_id: userInfo.headMechanismId}, {contacts: contacts}, 'FrequentContacts', function (err, u) {
                        if (!err) {
                            return res.json({status: 500});
                        } else {
                            return res.json({status: 100});
                        }
                    });
                }
            });
        }
    });
}


/**
 * 根据菜品查询供应商的报价
 */
exports.getSupplyDetails = function (req, res) {
    var mId = req.query.id; //获取食材ID
    console.info("mid:"+mId);
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var openId = userInfo.openId;
            var array = new Array();
            var catchArray = new Array();
            var distancecacheArray = new Array();
            var resultData;
            mongodbDao.queryBy({material_id: mId}, "SupplyPrice", function (err, data) {
                console.info(JSON.stringify(data));
                if (err) {
                    logger.log(err);
                }
                resultData = data;
                data.forEach(function (supply) {
                    catchArray.push(commonService.redisHget(openId, supply.supply_id));
                });
                Q.all(catchArray).then(function (success) {
                    for (var i = 0; i < success.length; i++) {
                        var distancecache = success[i];
                        var supply = data[i];
                        if (distancecache) {
                            distancecacheArray.push({mechanismId: supply.supply_id, distance: distancecache});
                        } else {
                            array.push(supply.supply_id);
                        }
                    }
                    //获取当前供应商与对应的餐厅的距离
                    geocodingApi.getDistanceByMechanismId(req, res, array).then(function (distanceArray) {
                        return distanceArray;
                    }).then(function (distanceArray) {
                        console.info(JSON.stringify(distanceArray)+"--------Lyf");
                        console.info(JSON.stringify(distancecacheArray)+"--------Lyf");
                        distanceArray.forEach(function (distanceJson) {
                            var supplyId = distanceJson.mechanismId;
                            var distance = distanceJson.distance;
                            //判断距离是否正确
                            if(!distance){
                                distance = -1;
                            }
                            data.forEach(function (supply) {
                                if (supply.supply_id === supplyId) {
                                    supply.distance = parseInt(distance);
                                }
                            });
                        });
                        distancecacheArray.forEach(function (distanceJson) {
                            var supplyId2 = distanceJson.mechanismId;
                            var distance2 = distanceJson.distance;
                            //判断距离是否正确
                            if(!distance2 || distance2==='NaN'){
                                distance2 = -1;
                            }
                            data.forEach(function (supply) {
                                if (supply.supply_id === supplyId2) {
                                    supply.distance = parseInt(distance2);
                                }
                            });
                        });
                        return res.render("restaurant/price_offer", {supplyList: data});
                    });
                }).catch(function (err) {
                    console.info(err);
                });
            })
        }
    });

    //userPromise(req, res).then(function (userInfo) {
    //    if (!userInfo) {
    //        return res.render('restaurant/noheadLogin');
    //    } else {
    //        var defereed = Q.defer();
    //        mongodbDao.queryBy({_id: new BSON.ObjectID(mId)}, "Material", function (err, data) {
    //            if (err) defereed.reject(new Error(err));
    //            defereed.resolve(data);
    //        });
    //        return defereed.promise;
    //    }
    //}).then(function (feed) {
    //    var defereed = Q.defer();
    //    var supplyArrs = feed[0].id;
    //    mongodbDao.queryBy({supply_id: {$in: supplyArrs}}, "SupplyPrice", function (err, data) {
    //        if (err)  defereed.reject(new Error(err));
    //        defereed.resolve(data);
    //    });
    //    return defereed.promise;
    //}).then(function (feed) {
    //     res.render("restaurant/price_offer", {supplyList: feed});
    //}).catch(function(err){
    //    console.log(err);
    //});
}

exports.userSetting = function (req, res) {

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({userName: userInfo.userName}, "User", function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    userInfo.userName = userInfo.userName;
                    if (users[0]) {
                        userInfo.realName = users[0].realName ? users[0].realName : '';
                        userInfo.mobileNo = users[0].mobileNo ? users[0].mobileNo : '';
                        userInfo.emailAddress = users[0].emailAddress ? users[0].emailAddress : '';
                        userInfo.password = '';
                    } else {
                        userInfo.realName = '';
                        userInfo.mobileNo = '';
                        userInfo.emailAddress = '';
                        userInfo.password = '';
                    }
                    return res.render('restaurant/my/user_info_setting', {userInfo: userInfo});
                }
            });
        }
    });
}

//修改个人用户信息
exports.saveUserInfoSetting = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var userType = userInfo.userType;
            var realName = req.body.realName;
            var mobileNo = req.body.mobileNo;
            var emailAddress = req.body.emailAddress;
            var password = req.body.password;
            mongodbDao.queryBy({userName: userInfo.userName}, "User", function (err, users) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    if (users.length > 0) {
                        mongodbDao.update({_id: users[0]._id}, {
                            realName: realName,
                            mobileNo: mobileNo,
                            emailAddress: emailAddress,
                            password: password
                        }, "User", function (err, users) {
                            return res.json({status: 100,userType:userType});
                        });
                    }
                }
            });
        }
    });
}

//待处理订单
exports.getPendingOrders = function (req, res) {

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var search = {}
            search = {restruantId: userInfo.mechanism_id.toString()};//
            if (userInfo.userType == '1') {

                var order = {restruantId: new BSON.ObjectID(userInfo.mechanism_id.toString())};//
                //商家
            } else if (userInfo.userType == '2') {
                //餐厅
                search = {toSupply: userInfo._id, orderStatus: "P"};

            }
            mongodbDao.getCount(search, "Orders", function (err, feed) {
                if (err) {
                    console.log(err);
                    return err;
                }
                return res.json(feed);
            });
        }
    });

}


//根据菜名查找菜品
exports.getMaterialByName = function (req, res) {
    var materialName = req.query.materialName;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            //模糊查询功能添加
            var searchQ = {}
            var pattern = new RegExp("^.*" + materialName + ".*$");
            searchQ.name = pattern;

            //mongodbDao.queryBy(searchQ, "Material", function (err, feed) {
            mongodbDao.queryBy({name: materialName}, "Material", function (err, feed) {
                if (feed.length > 0) {
                    var MaterialId = feed[0]._id.toString();
                    //res.redirect("/getSupplyPrice?id=" + MaterialId + "&openId=" + userInfo.openId);
                    if (userInfo.userType == '1') {
                        return res.render("restaurant/template/searchedMetiralDetial", {material: feed});
                    } else {
                        return res.render("supply/template/searchedMetiralDetial", {material: feed});
                    }
                } else {
                    if (userInfo.userType == '1') {
                        return res.render("restaurant/template/searchedMetiralDetial", {material: []});
                    } else {
                        return res.render("supply/template/searchedMetiralDetial", {material: []});
                    }
                }
            });
        }
    });
}

//合并下单
exports.mergeOrders = function (req, res) {
    var orderId = req.body.ids;
    var orderStats = req.body.orderStatus;
    orderId = orderId.split(',');
    var searchQ = [];
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var userName = userInfo.userName;
            var userId = userInfo.id;
            if(userInfo.isConfirme!='1'){
                return res.json({status: 500,message:'订单已提交总部,由总部审核后配送'});
            }
            for (var i = 0; i < orderId.length; i++) {
                searchQ.push(new BSON.ObjectID(orderId[i]));
            }
            mongodbDao.updateBatch({_id: {$in: searchQ}}, {orderStatus: "N",comfirmeUserName:userName,comfirmeUserId:userId}, "Orders", function (err, feed) {
                if (err) {
                    console.log(err);
                } else {
                    //发送模版消息
                    orderId.forEach(function(orderIdStr){
                        commonService.sendOrderTemplate(orderIdStr);
                    });
                    return res.json({status: 100});
                }
            });//改为已付款订单状态
        }
    });

}


//确认收货
exports.confReceivedOrder = function (req, res) {

    var orderId = req.body.ids;
    var paidArray = JSON.parse(req.body.paidArray);
    var receiverName = req.body.receiver;
    //orderId=orderId.split(',');
    var searchQ = [];
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }

            var sqlArray = new Array();
            paidArray.forEach(function (paidIn) {
                var materialId = paidIn.materialId;
                var value = paidIn.value;

                var criteria = {_id: new BSON.ObjectID(orderId), 'orderItem.materialId': materialId};
                var newData = {'orderItem.$.paidIn': value}
                sqlArray.push(Q.nfcall(mongodbDao.update, criteria, newData, 'Orders'));
            });
            Q.all(sqlArray).then(function (results) {
                if (results && results.length > 0 && results[0] && results[0][0] === 1) {
                    mongodbDao.update({_id: new BSON.ObjectID(orderId)}, {
                        orderStatus: "R",
                        receiver: receiverName,
                        receiverId: userInfo.id.toString()
                    }, "Orders", function (err, feed) {
                        if (err) {
                            console.log(err);
                        } else {
                            //发送模版
                            commonService.sendOrderTemplate006(orderId);
                            return res.json({status: 100});
                        }
                    });//改为已付款订单状态

                } else {
                    console.log('数据库操作失败');
                    return res.json({status: 500});
                }
            });

        }


    });

}


//查询某一供应商公开报价单
exports.getPublicOfferShet = function (req, res) {

    var supId = req.query.supId;
    var materialId = req.query.materialId;

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {

            return res.render('restaurant/noheadLogin');
        } else {
            var now = new Date();
            var lw = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
            mongodbDao.queryBy({
                'materials.material_id': {$in: [materialId]},
                supply_id: supId,
                isPublic: '1',
                '$and': [{createdAt: {$gt: lw}}, {createdAt: {$lt: now}}]
            }, 'OfferSheet', function (err, data) {
                if (err) {
                    console.log(err);
                    //错误页面，系统出错页面
                } else {
                    data.forEach(function (offer) {
                        offer.createdAt = commonUtil.formatDate(offer.createdAt, 'yyyy-MM-dd hh:mm');
                    });
                    res.render('restaurant/publicPriceOffer', {offerSheetList: data});
                }
            });
        }
    });
}

//查看报价单明细
exports.getOfferSheetDetials = function (req, res) {

    var OfferSheetId = req.query.offerId;

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {

            return res.render('restaurant/noheadLogin');
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(OfferSheetId)}, 'OfferSheet', function (err, data) {
                if (err) {

                    console.log(err);//调整到错误页面
                } else {
                    res.render('restaurant/placingOrder', {offerSheet: data[0], readOnly: true});
                }


            });

        }
    });
}

//餐厅添加组员页面
exports.myteamMember01 = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var openId = userInfo.openId;
            mongodbDao.queryBy({openId: openId, userAuth: '1'}, 'User', function (err, data) {
                var mechanism_id = data[0].mechanism_id;//机构ID
                var headMechanismId = data[0].headMechanismId;//总店ID
                var headMechanismName = data[0].headMechanismName;
                //只有mechanism_id与headMechanismId相等的时候才能证明这个人是总店的管理员  证明他是总店管理员才有邀请权限
                if (!!err) {
                    res.json({code: 1001, errmsg: '系统问题'});//系统问题
                } else if (data.length == 0) {
                    res.json({code: 1002, errmsg: '没有权限'});//这个人不是管理员
                } else if (data.length > 1) {
                    res.json({code: 1003, errmsg: '操作错误'});//系统数据库 数据错误
                } else if (data.length == 1 && mechanism_id == headMechanismId) {
                    //当前这个人是总店的管理员
                    var headMechanismId = data[0].headMechanismId;
                    mongodbDao.queryBy({_id: new BSON.ObjectID(headMechanismId)}, 'Restruant', function (err, data) {
                        if (!!err) {
                            res.json({code: 1001, errmsg: '系统问题'});//系统问题
                        } else {
                            if (data[0]) {

                                var chainRest = data[0].chainStoredIds;
                                var crArray = [];
                                crArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(headMechanismId)}, 'Restruant'));
                                for (var i = 0; i < chainRest.length; i++) {
                                    crArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(chainRest[i])}, 'Restruant'));
                                }
                                Q.all(crArray).then(function (success) {
                                    console.log("headMechanismId:" + headMechanismId);
                                    return res.render('common/addTeamUser01', {
                                        data: success,
                                        headMechanismId: headMechanismId,
                                        headMechanismName: headMechanismName,
                                        openId: openId
                                    });

                                });
                            } else {
                                return res.render('common/addTeamUser01', {
                                    data: "",
                                    headMechanismId: "",
                                    headMechanismName: ""
                                })

                            }


                        }
                    });
                } else {
                    console.log("userName:" + userInfo.userName + '不是总店管理员不具有邀请操作');
                    return res.json({code: 1003});
                }
            });
        }
    });
}


/**
 * 订单模板获取订单信息
 * @param req
 * @param res
 */
exports.getOrderByIdModel = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var orderId = req.query.ordId;
            var orderSearch = {_id: BSON.ObjectID(orderId)};
            mongodbDao.queryBy(orderSearch, 'Orders', function (err, feed) {
                if (err) {
                    console.log(err);
                } else {
                    if (userInfo.userType == '2') { //如果是供应商
                        if (feed[0].orderStatus == 'N') {
                            return res.render("common/preparingSending", {ordersDetail: feed});
                        } else {
                            res.render("restaurant/list_detalis", {ordersDetail: feed});
                        }

                    } else {

                        if (feed[0].orderStatus == 'S') {//已经配送
                            res.render("restaurant/template/confirmeReceived", {ordersDetail: feed}); //跳转到确认收货页面
                        } else {
                            res.render("restaurant/list_detalis", {ordersDetail: feed});
                        }
                    }
                }
            });
        }
    });
}


//下单选择配送地址页面
exports.queryDistInformation = function (req, res) {
    var orderItem = req.body.orderItem;
    var offerSheetId = req.body.offerSheetId;
    var offerSheetName = req.body.offerSheetName;
    var toSupply = req.body.toSupply;
    var sum = req.body.sum;
    var supplyName = req.body.supplyName;

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {

            var mechanism_id = userInfo.mechanism_id;//机构ID
            //查询该用户餐厅信息
            var restruantArray = new Array();
            mongodbDao.findById(mechanism_id, 'Restruant', function (err, restruant) {
                //判断使是否为总店，如是ishead 为1，则该餐厅为总店
                if (restruant && restruant.isHead == '1') {

                    restruantArray.push(restruant);
                    var idArray = new Array();
                    var chainStoredIds = restruant.chainStoredIds;
                    if (chainStoredIds.length > 0) {
                        chainStoredIds.forEach(function (chainStoredId) {
                            if (chainStoredId != '') {
                                idArray.push(new BSON.ObjectID(chainStoredId));
                            }
                        });
                        mongodbDao.queryBy({_id: {$in: idArray}}, 'Restruant', function (err, restruants) {
                            if (restruants) {
                                restruants.forEach(function (restruantcopy) {
                                    if (restruantcopy) {
                                        restruantArray.push(restruantcopy);
                                    }
                                });
                                return res.render('restaurant/inqueySheet/distInformation', {
                                    restruantArray: JSON.stringify(restruantArray),
                                    orderItem: orderItem,
                                    offerSheetId: offerSheetId,
                                    offerSheetName: offerSheetName,
                                    toSupply: toSupply,
                                    sum: sum,
                                    supplyName: supplyName
                                });
                            }
                        });

                    } else {
                        return res.render('restaurant/inqueySheet/distInformation', {
                            restruantArray: JSON.stringify(restruantArray),
                            orderItem: orderItem,
                            offerSheetId: offerSheetId,
                            offerSheetName: offerSheetName,
                            toSupply: toSupply,
                            sum: sum,
                            supplyName: supplyName
                        });
                    }
                } else if (restruant && restruant.isHead == '0') {

                    restruantArray.push(restruant);

                    return res.render('restaurant/inqueySheet/distInformation', {
                        restruantArray: JSON.stringify(restruantArray),
                        orderItem: orderItem,
                        offerSheetId: offerSheetId,
                        offerSheetName: offerSheetName,
                        toSupply: toSupply,
                        sum: sum,
                        supplyName: supplyName
                    });
                }


            });
        }
    });
}


//查询订单详细信息
function queryOrderById(orderId) {
    return Q.Promise(function (resolve, reject) {
        if (!orderId) {
            return reject({code: 500, msg: 'orderId is null'});
        }
        mongodbDao.findById(orderId, 'Orders', function (err, order) {
            if (err) {
                return reject({code: 500, msg: err});
            } else if (!order) {
                return reject({code: 500, msg: 'order is null'});
            } else {
                return resolve(order);
            }
        });
    });
}


exports.queryOrderDetails = function (req, res) {
    var orderId = req.query.orderId;
    queryOrderById(orderId).then(function (order) {
        return res.render('restaurant/orderDetails', {order: order});
    }).done(null, function (err) {
        console.log(err);
    })
}

/**
 *查询单个餐厅信息公共方法
 * @param restaurantId 餐厅id
 * @returns {*} 餐厅对象
 */
function queryRestaurant(restaurantId) {
    return Q.Promise(function (resolve, reject) {
        //查询餐厅信息
        mongodbDao.findById(restaurantId, 'Restruant', function (err, restruant) {
            if (err) {
                return reject({code: 500, msg: err});
            } else if (!restruant) {
                return reject({code: 500, msg: 'restruant is null'});
            } else {

                return resolve(restruant);
            }
        });
    });
}

//批量查询餐厅信息
/**
 * 批量查询餐厅信息公共方法
 * @param restaurantIds 餐厅id数组
 * @returns {*} 餐厅对象数组
 */
function queryRestaurants(restaurantIds) {
    return Q.Promise(function (resolve, reject) {
        //查询餐厅信息
        var idArray = new Array();
        restaurantIds.forEach(function (restaurantId) {
            idArray.push(new BSON.ObjectID(restaurantId));
        });
        mongodbDao.queryBy({_id: {$in: idArray}}, 'Restruant', function (err, restruants) {
            if (err) {
                console.log(err);
                return reject({code: 500, msg: err});
            } else if (!restruants) {
                return reject({code: 500, msg: 'restruants is null'});
            } else {
                return resolve(restruants);
            }
        });
    });
}
/**
 *查询单个供应商信息公共方法
 * @param restaurantId 餐厅id
 * @returns {*} 餐厅对象
 */
function querySupply(supplyId) {
    return Q.Promise(function (resolve, reject) {
        //查询餐厅信息
        mongodbDao.findById(supplyId, 'Supply', function (err, supply) {
            if (err) {
                return reject({code: 500, msg: err});
            } else if (!supply) {
                return reject({code: 500, msg: 'supply is null'});
            } else {

                return resolve(supply);
            }
        });
    });
}

/**
 * 查询机构信息，机构未餐厅，和供应商信息
 * @param req
 * @param res
 */
exports.queryMechanismByuser = function (req, res) {
    var optiontype = req.query.type;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            console.log("1111" + userInfo.mechanism_name);
            var type = userInfo.userType;
            var mechanismArray = new Array();
            var userAuth = userInfo.userAuth;
            //判断是否为餐厅用户
            if (type === '1') {
                queryRestaurant(mechanism_id).then(function (restaurant) {
                    mechanismArray.push(restaurant);
                    if (restaurant.isHead === '1') {
                        if (!restaurant.chainStoredIds) {
                            //判断是否为我的餐厅，type：1为我的餐厅信息，0:为我的组员
                            if (optiontype == 1) {
                                return res.render('restaurant/myRestruant', {
                                    userAuth: userAuth,
                                    userType: type,
                                    mechanismArray: mechanismArray
                                });
                            } else {
                                return res.render('common/myRestruant', {
                                    userAuth: userAuth,
                                    userType: type,
                                    mechanismArray: mechanismArray
                                });
                            }
                        } else {
                            queryRestaurants(restaurant.chainStoredIds).then(function (restaurants) {
                                mechanismArray = _._.union(mechanismArray, restaurants);
                                //判断是否为我的餐厅，type：1为我的餐厅信息，0:为我的组员
                                if (optiontype == 1) {
                                    return res.render('restaurant/myRestruant', {
                                        userAuth: userAuth,
                                        userType: type,
                                        mechanismArray: mechanismArray
                                    });
                                } else {
                                    return res.render('common/myRestruant', {
                                        userAuth: userAuth,
                                        userType: type,
                                        mechanismArray: mechanismArray
                                    });
                                }
                            });
                        }
                    } else {
                        console.log("333333");
                        //判断是否为我的餐厅，type：1为我的餐厅信息，0:为我的组员
                        if (optiontype == 1) {
                            return res.render('restaurant/myRestruant', {
                                userAuth: userAuth,
                                userType: type,
                                mechanismArray: mechanismArray
                            });
                        } else {
                            return res.render('common/myRestruant', {
                                userAuth: userAuth,
                                userType: type,
                                mechanismArray: mechanismArray
                            });
                        }
                    }
                });

                //否则未供应商用户
            } else {
                querySupply(mechanism_id).then(function (supply) {
                    mechanismArray.push(supply);
                    //判断是否为我的餐厅，type：1为我的供应商信息，0:为我的组员
                    if (optiontype == 1) {
                        return res.render('restaurant/myRestruant', {
                            userAuth: userAuth,
                            userType: type,
                            mechanismArray: mechanismArray
                        });
                    } else {
                        return res.render('common/mySuplly', {
                            userAuth: userAuth,
                            userType: type,
                            mechanismArray: mechanismArray
                        });
                    }
                });
            }
        }
    });
}

/**
 * 查询餐厅信息
 * @param req
 * @param res
 */
exports.queryMechanismDetails = function (req, res) {
    var mechanismId = req.query.mechanismId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var isConfirme = userInfo.isConfirme;
            var type = userInfo.userType;
            if (type === '1') {
                queryRestaurant(mechanismId).then(function (restaurant) {
                    //判断用户是否有权限,1为有编辑权限，0为否
                    if (isConfirme === '1') {
                        return res.render('restaurant/restruantDetailsUpdate', {restaurant: restaurant});
                    } else {
                        return res.render('restaurant/restruantDetails', {restaurant: restaurant});
                    }

                });
            } else if (type === '2') {
                querySupply(mechanismId).then(function (supply) {
                    if (isConfirme === '1') {
                        return res.render('supply/my/supplyDetailsUpdate', {supply: supply});
                    } else {
                        return res.render('supply/my/supplyDetails', {supply: supply});
                    }

                })
            }
        }
    });

}


//主动配送选择配送地址页面
exports.queryDistInformationOffer = function (req, res) {
    var orderItem = req.body.orderItem;
    var sum = req.body.sum;
    var restruantdId = req.body.restruantdId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {

            //查询餐厅信息
            var restruantArray = new Array();
            queryRestaurant(restruantdId).then(function (restaurant) {
                restruantArray.push(restaurant);
                if (restaurant.isHead === '1') {
                    queryRestaurants(restaurant.chainStoredIds).then(function (restaurants) {
                        restruantArray = _._.union(restruantArray, restaurants);
                        return res.render('supply/offersheet/distInformation', {
                            orderItem: orderItem,
                            sum: sum,
                            restruantArray: JSON.stringify(restruantArray)
                        });
                    });
                } else {
                    queryRestaurant(mechanism_id).then(function (restaurant) {
                        restruantArray.push(restaurant);
                        return res.render('supply/offersheet/distInformation', {
                            orderItem: orderItem,
                            sum: sum,
                            restruantArray: JSON.stringify(restruantArray)
                        });
                    });
                }
            });
        }
    });
}

exports.setRestaurantPage = function (req, res) {
    var mId = req.query.mId;
    var uId = req.query.uId
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('admin/login');
        } else {
            var headMechanismId = userInfo.headMechanismId;
            mongodbDao.queryBy({_id: new BSON.ObjectID(headMechanismId)}, 'Restruant', function (err, data) {
                if (!!err) {
                    res.json({code: 1001});//系统问题
                } else {
                    var chainRest = data[0].chainStoredIds;
                    var crArray = [];
                    crArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(headMechanismId)}, 'Restruant'));
                    for (var i = 0; i < chainRest.length; i++) {
                        crArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(chainRest[i])}, 'Restruant'));
                    }
                    Q.all(crArray).then(function (success) {
                        return res.render('restaurant/my/setRestaurantPage', {
                            data: success,
                            mId: mId,
                            uId: uId,
                            headMechanismId: headMechanismId
                        });

                    });
                }
            });
        }

    });
}

exports.setRestaurant = function (req, res) {
    var uId = req.body.uId;
    var mId = req.body.mId;
    var name = req.body.name;
    console.log('uId' + uId + 'mId' + mId + 'name' + name);
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('admin/login');
        } else {
            mongodbDao.update({_id: new BSON.ObjectID(uId)}, {
                mechanism_id: mId,
                mechanism_name: name
            }, 'User', function (err, data) {
                if (err) {
                    return res.json({status: 500})
                } else {
                    //修改缓存数据
                    mongodbDao.findById(uId, 'User', function (err, user) {
                        if (err) {
                            return res.json({status: 400});
                        } else {
                            var openId = user.openId;
                            //更新缓存数据
                            redisDao.getInstance().hset(openId, "mechanism_id", mId);
                            redisDao.getInstance().hset(openId, "mechanism_name", name);

                        }
                    });

                    res.json({status: 100});
                }

            });
        }
    });

}

/**
 * 跟新订单操作
 * @param orderId 更新条件
 * @param newData 更新信息json对象
 * @returns {*}
 */
function updateOrder(criteria, newData) {
    return Q.Promise(function (resolve, reject) {
        mongodbDao.update(criteria, newData, 'Orders', function (err, result) {
            if (err) {
                console.log(err);
                return reject({code: 500, msg: err});
            } else if (!result || result != 1) {
                console.log('更新订单对象，数据库操作错误');
                return reject({code: 500, msg: '更新订单对象，数据库操作错误'});
            } else {
                return resolve(result);
            }
        });
    });
}
/**
 * 修改订单
 * @param req
 * @param res
 */
exports.updateOrderforPendind = function (req, res) {
    userPromise(req,res).then(function(userInfo){
        var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
        if(isGuest==0){
            return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
        }
        var order = JSON.parse(req.body.order);
        var criteria = {_id: new BSON.ObjectID(order._id)};
        delete order['_id'];
        delete order['createdAt'];
        updateOrder(criteria, order).then(function (result) {
            if (result === 1) {
                return res.json({code: 100});
            }
        }).done(null, function (err) {
            return res.json({code: 500, msg: err});
        });
    });

}
/**
 * 修改机构信息
 * @param req
 * @param res
 */
exports.updateMechanismInfo = function (req, res) {
    userPromise(req,res).then(function(userInfo){
        var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
        if(isGuest==0){
            return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
        }
        var mechanismInfo = JSON.parse(req.body.mechanismInfo);
        var id = req.body.id;
        //判断是否为餐厅信息
        if (mechanismInfo.type === '1') {
            //修改餐厅信息
            Q.nfcall(mongodbDao.update, {_id: new BSON.ObjectID(id)}, mechanismInfo, 'Restruant').then(function (result) {
                //判断是否更改餐厅信息成功
                if (result) {
                    var array = new Array();
                    array.push(mongodbDao.classUpdatePromise({
                        mechanism_id: id,
                        userType: mechanismInfo.type
                    }, {mechanism_name: mechanismInfo.name}, 'User'));
                    //array.push(mongodbDao.classUpdatePromise({
                    //    isCustomer: '1',
                    //    mechanism_id: id,
                    //    mechanism_type: mechanismInfo.type
                    //}, {mechanism_name: mechanismInfo.name}, 'Material'));
                    // array.push(mongodbDao.classUpdatePromise({restruant_id:id},{restruantName:mechanismInfo.name},'CInquerySheet'));
                    return Q.all(array);
                }
            }).then(function (resultArray) {
                console.info(JSON.stringify(resultArray));
                if (!resultArray || resultArray.length != 1) {
                    console.log('updateMechanismInfo:更改餐厅沉余餐厅名数据失败！');
                    return res.json({code: 500});
                } else if (!resultArray[0]) {
                    console.log('updateMechanismInfo:更改User餐厅沉余餐厅名数据失败！');
                    return res.json({code: 500});
                } else {
                    return res.json({code: 100});
                }
                //else if (!resultArray[1]) {
                //    console.log('updateMechanismInfo:更改Material餐厅沉余餐厅名数据失败！');
                //    return res.json({code: 500});
                //}
                //else if(!resultArray[2]){
                //    console.log('updateMechanismInfo:更改CInquerySheet餐厅沉余餐厅名数据失败！');
                //}
            }).catch(function (err) {
                console.info(err);
            }).done(null, function (err) {
                console.info(err);
            })
        } else {
            Q.nfcall(mongodbDao.update, {_id: new BSON.ObjectID(id)}, mechanismInfo, 'Supply').then(function (result) {
                console.info('result:' + result);
                //判断是否更改餐厅信息成功
                if (result) {
                    var array = new Array();
                    array.push(mongodbDao.classUpdatePromise({
                        mechanism_id: id,
                        userType: mechanismInfo.type
                    }, {mechanism_name: mechanismInfo.name}, 'User'));
                    //array.push(mongodbDao.classUpdatePromise({
                    //    isCustomer: '1',
                    //    mechanism_id: id,
                    //    mechanism_type: mechanismInfo.type
                    //}, {mechanism_name: mechanismInfo.name}, 'Material'));
                    // array.push(mongodbDao.classUpdatePromise({supply_id:id},{supply_Name:mechanismInfo.name},'SupplyPrice'));
                    return Q.all(array);
                }
            }).then(function (resultArray) {
                console.info(JSON.stringify(resultArray));
                if (!resultArray || resultArray.length != 1) {
                    console.log('updateMechanismInfo:更改供应商沉余餐厅名数据失败！');
                    return res.json({code: 500});
                } else if (!resultArray[0]) {
                    console.log('updateMechanismInfo:更改User供应商沉余餐厅名数据失败！');
                    return res.json({code: 500});
                } else {
                    return res.json({code: 100});
                }
                //else if (!resultArray[1]) {
                //    console.log('updateMechanismInfo:更改Material供应商沉余餐厅名数据失败！');
                //    return res.json({code: 500});
                //}
                //else if(!resultArray[2]){
                //    console.log('updateMechanismInfo:更改CInquerySheet餐厅沉余餐厅名数据失败！');
                //}
            }).catch(function (err) {
                return console.info(err);
            }).done(null, function (err) {
                return console.info(err);
            })
        }
    });

}

