//供应商部分服务
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
var offerSheetService = require('./supply/OfferSheetService');
var _ = require('underscore');
var commonService = require('./commonService');
var geocodingApi = require('./geocodingApi');

//测试用 跳转到供应商我的页面
exports.jumpddMyPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            res.render('supply/my/my', {title: "我的", userAuth: userInfo.userAuth});
        }
    });
}

exports.supIndex = function (req, res) {

    var vcatetoryId = req.query.categoryId;
    var qNumPage = req.query.numPage, qPageIdx = req.query.pageIdx;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            var queryArrary = [];
            var _numberPage = 9, _skipIdx, _lastIdx, //默认每页显示十条，从第一页开始显示
                pageIdx = 1;
            if (qNumPage) {
                _numberPage = qNumPage;
            }
            if (qPageIdx) {
                pageIdx = qPageIdx;
            }
            _skipIdx = _numberPage * (pageIdx - 1);
            _lastIdx = _numberPage * pageIdx;
            //获取类别id，获取所有食材
            //如果id类别为零。则查询所有类别
            var search = {}
            if (vcatetoryId && vcatetoryId != '0' && vcatetoryId != 'no') {
                search = {categoryId: vcatetoryId};
            }
            return Q.all([Q.nfcall(mongodbDao.queryBy, {}, "Category"),
                Q.nfcall(mongodbDao.pagingQuery, search, "Material", {restaurantNum: -1}, _skipIdx, _lastIdx)]);
        }
    }).then(function (feed) {
        if (vcatetoryId && vcatetoryId != 'no') { //是否加载模版
            res.json({category: feed[0], materials: feed[1], title: "首页"})
        } else if (vcatetoryId == 'no') {
            return res.render("supply/index", {
                title: "首页", category: feed[0],
                materials: feed[1],
                openId: getOpenId(req)
            });
        } else {
            return res.render("supply/template/pageLayout", {
                title: "首页", category: feed[0],
                materials: feed[1],
                openId: getOpenId(req)
            });
        }
    });
}


/**
 * 我的供应商－－常用联系人
 * @param req
 * @param res
 */
exports.supContacts = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
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
                                queryArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(contacts[_startIdx])}, 'Restruant'));
                            }
                        }
                        Q.all(queryArray).then(function (success) {
                            res.render('supply/my/contacts', {
                                title: "常联系人",
                                contacts: success,
                                _currentIdx: _currentIdx,
                                userType: userInfo.userType
                            });
                        });
                    } else {
                        return res.render('supply/my/contacts', {title: "常联系人", contacts: []});
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
exports.supDelContacts = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            mongodbDao.queryBy({mechanism_id: userInfo.headMechanismId}, 'FrequentContacts', function (err, data) {
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
 * 供应商询价单查询
 * @param req
 * @param res
 */
exports.priceInquery = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            //查询非公开针对本供应商的询价单
            Q.nfcall(mongodbDao.queryBy, {
                supplyId: mechanism_id,
                start: '1'
            }, 'InquerySheet').then(function (inquerySheets) {
                if (!inquerySheets || inquerySheets.length == 0) {
                    res.render('supply/offersheet/price_inquery_copy3', {
                        title: '询价单',
                        inquerySheets: JSON.stringify([])
                    });

                } else {
                    inquerySheets.forEach(function (inquerySheet) {
                        inquerySheet.createdAt = commonUtil.formatDate(inquerySheet.createdAt, 'yyyy-MM-dd hh:mm:ss');
                    });
                    res.render('supply/offersheet/price_inquery_copy3', {
                        title: '询价单',
                        inquerySheets: JSON.stringify(inquerySheets)
                    });
                }
            });
        }
    });
}


/**
 * 供应商询价单查询
 * @param req
 * @param res
 */
exports.supMyOrders = function (req, res) {
    //判断是否来自点击的模版.
    var hasHead = req.query.hasHead;
    var anchor = req.query.anchor;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            //var orderCreator =userInfo.userName; //订单创建者。仅供开发阶段测F试，真实情况，默认是查询登陆用户的订单。
            //var order={toSupply:userInfo.userName};
            var order = {toSupply: userInfo.mechanism_id.toString()};//
            mongodbDao.queryBy(order, 'Orders', function (err, feed) {
                if (err) {
                    console.log(err);
                } else {
                    var sendOrders = [];
                    var deliveryOrders = [];
                    var receivedOrders = [];

                    for (var i = 0; i < feed.length; i++) {

                        var order = feed[i];
                        //格式化日期
                        order.createdAt = commonUtil.formatDate(order.createdAt, 'yyyy-M-d  h:m:s');
                        if (order.orderStatus == 'N') {//new
                            sendOrders.push(order); // 新下单，已经付款，未配送
                        }
                        else if (order.orderStatus == 'S') {  //配送中,等待验收
                            deliveryOrders.push(order); //
                        }

                        else if (order.orderStatus == 'R') {   //已经验收订单
                            receivedOrders.push(order); //
                        }

                    }
                    if (hasHead) {
                        hasHead = true;
                    } else {
                        hasHead = false;
                    }
                    anchor = anchor ? anchor : '0';
                    res.render("supply/my/my_order_list", {
                        sendOrder: sendOrders,
                        deliveryOrders: deliveryOrders,
                        receivedOrders: receivedOrders,
                        title: '我的订单',
                        userType: userInfo.userType,
                        openId: userInfo.openId,
                        hasHead: hasHead,
                        anchor: anchor
                    });
                }
            });
        }
    });
}

/**
 * 查询对某个食材有共看询价的餐厅
 * @param req
 * @param res
 */
exports.getInqueryResturants = function (req, res) {
    var materialId = req.query.mid;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            var openId = userInfo.openId;
            var resultData;
            var array = new Array();
            var distancecacheArray = new Array();
            mongodbDao.queryBy({material_id: materialId}, 'CInquerySheet', function (err, data) {
                if (err) {
                    logger.log(err);
                }
                resultData = data;
                var catchArray = [];
                data.forEach(function (returant) {
                    returant.updatedAt = commonUtil.formatDate(returant.updatedAt, 'yyyy-MM-dd');
                    //查询redis是否有缓存纪录
                    catchArray.push(commonService.redisHget(openId, returant.restruantId));
                });
                Q.all(catchArray).then(function (success) {
                    for (var i = 0; i < success.length; i++) {
                        var distancecache = success[i];
                        var returant = data[i];
                        if (distancecache) {
                            distancecacheArray.push({mechanismId: returant.restruantId, distance: distancecache});
                        } else {
                            array.push(returant.restruantId);
                        }
                    }
                    geocodingApi.getDistanceByMechanismId(req, res, array).then(function (distanceArray) {
                        return distanceArray;
                    }).then(function (distanceArray) {
                        distanceArray.forEach(function (distanceJson) {
                            var restruantId = distanceJson.mechanismId;
                            var distance = distanceJson.distance;
                            if(!distance || distance==='NaN'){
                                distance = -1;
                            }
                            resultData.forEach(function (returant) {
                                if (returant.restruantId === restruantId) {
                                    returant.distance = parseInt(distance);
                                }
                            });
                        });
                        distancecacheArray.forEach(function (distanceJson) {
                            var restruantId2 = distanceJson.mechanismId;
                            var distance2 = distanceJson.distance;
                            if(!distance2 || distance2==='NaN'){
                                distance2 = -1;
                            }
                            resultData.forEach(function (returant) {
                                if (returant.restruantId === restruantId2) {
                                    returant.distance = parseInt(distance2);
                                }
                            });
                        });
                        return res.render("supply/template/price_offer_resturant", {resturantList: data});
                    });
                }).catch(function (err) {
                    console.info(err);
                });
            });
        }
    });
}



//获取某个餐厅所有询价单
exports.getInqSheetList = function (req, res) {
    var restID = req.query.restId;
    var materalId = req.query.materalId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            //根据餐厅查询所有公开询价单
            var now = new Date();
            var lw = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
            return Q.nfcall(mongodbDao.queryBy, {
                'materials.material_id': {$in: [materalId]},
                restruant_id: restID,
                isPublic: '1',
                '$and': [{createdAt: {$gt: lw}}, {createdAt: {$lt: now}}]
            }, "InquerySheet");
        }
    }).then(function (feed) {
        feed.forEach(function (sheet) {
            sheet.createdAt = commonUtil.formatDate(sheet.createdAt, 'yyyy-MM-dd');
        });
        res.render("supply/template/price_Inq_Sheet", {reqSheetList: feed});

    });

}

function qryInqueryByIdPromis(req, res, inquerySheetId) {
    return Q.Promise(function (resolve, reject) {
        userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('supply/login');
            } else {
                //通过订单id查询订单信息
                mongodbDao.queryBy({_id: new BSON.ObjectID(inquerySheetId)}, "InquerySheet", function (err, feed) {
                    var inquerySheet = feed[0];
                    var start = inquerySheet.start === '2' ? '1' : '0';
                    //获取需要询价的食材
                    var materials = feed[0].materials;
                    var materailNew = new Array();
                    console.info(JSON.stringify(materials));
                    materials.forEach(function (material) {
                        if (material.isInquery === '1') {
                            materailNew.push({
                                material_id: material.material_id,
                                material_name: material.material_name,
                                unit: material.material_unit,
                                remark: material.material_remark,
                                isOffer: '1',//默认都报价
                                price: '0.00'
                            });
                        }
                    });
                    //包装成报价单
                    var offerSheetData = {
                        name: inquerySheet.restruantName,
                        materials: materailNew,
                        supply_id: '',
                        supplyName: '',
                        isPublic: '0',
                        restruantdId: inquerySheet.restruant_id,
                        restruantdName: inquerySheet.restruantName,
                        start: start,
                        createUserId: '',
                        comfirmeUserId: ''
                    }
                    resolve(offerSheetData);
                });
            }
        });
    });
}

/**
 * 根据询价单id查询询价单
 * @param req
 * @param res
 */
exports.qryInqueryById = function (req, res) {
    var inquerySheetId = req.query.oId;
    var openId = req.query.openId;
    var isHead = req.query.isHead ? req.query.isHead : 'false';

    qryInqueryByIdPromis(req, res, inquerySheetId).then(function (offerSheetData) {
        var materialIds = new Array();
        //if(offerSheetData.start==='1'){
        //    return res.render('admin/remind',{msg:'该模板已过期或该订单已经报价！'});
        //}
        offerSheetData.materials.forEach(function (material) {
            materialIds.push(material.material_id.toString());
        });
        //查询食材历史表，获取食材历史报价（根据询价单报价的报价单，只有单价是可以从历史表中获取数据的）
        userPromise(req, res).then(function (userInfo) {
            if (userInfo) {
                offerSheetService.queryMaterialHis(userInfo.mechanism_id, userInfo.userType, materialIds).then(function (materials) {
                    materials.forEach(function (material) {
                        offerSheetData.materials.forEach(function (offerMaterial) {
                            if (offerMaterial.material_id === material.materialId) {
                                offerMaterial.price = material.price;
                            }
                        });
                    });
                    return res.render('common/offerConfirm', {
                        offerSheetData: JSON.stringify(offerSheetData),
                        inquerySheetId: inquerySheetId,
                        openId: openId,
                        isHead: isHead
                    });
                });
            } else {
                return res.render('common/offerConfirm', {
                    offerSheetData: JSON.stringify(offerSheetData),
                    inquerySheetId: inquerySheetId,
                    openId: openId,
                    isHead: isHead
                });
            }
        });
    });
}

exports.sendingOrder = function (req, res) {
    var orderId = req.body.orderId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('supply/login');
        } else {
            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }
            mongodbDao.update({_id: new BSON.ObjectID(orderId)}, {orderStatus: "S"}, "Orders", function (err, feed) {
                if (err) {
                    console.log(err);
                } else {
                    //发送配送模板
                    commonService.sendOrderTemplate005(orderId);
                    return res.json({status: 100});
                }
            });//改为已付款订单状态
        }
    });
}

exports.myteamMember02 = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var openId = userInfo.openId;
            var type = userInfo.userType;
            var mechanism_id = userInfo.mechanism_id;
            var supplyArray = new Array();
            var userArray = new Array();
            //获取机构信息
            Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(mechanism_id)}, 'Supply').then(function (supplys) {
                if (!supplys || supplys.length == 0) {
                    console.log('找不到ID：' + mechanism_id + '对应的供应商信息');
                    supplyArray = [];
                } else if (supplys.length > 1) {
                    console.log('ID：' + mechanism_id + '对应的供应商信息有多个，有脏数据');
                    supplyArray = [];
                } else {
                    supplyArray = supplys;
                }
                if (supplyArray.length != 0) {
                    return res.render('common/addTeamUser02', {suplly: supplyArray,openId:openId});
                } else {
                    return res.render('common/addTeamUser02', {suplly: [],openId:openId});
                }
            }).catch(function (err) {
                console.log(err);
                return res.render('common/addTeamUser02', {suplly: [],openId:openId});
            });

        }
    });
}






