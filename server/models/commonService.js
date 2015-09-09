/**
 * Created by Hades on 15/5/29.
 */

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
var template = require('./restaurant/templateService');
var sendMtemplate = require('./sendMtemplate');
var _ = require('underscore');
var request = require('request');
var ObjectID = require('mongodb').ObjectID;
var offerSheetService = require('./supply/OfferSheetService');


exports.daoTest = function (req, res) {
    var old = {_id: new BSON.ObjectID("558bdf6d7656a16c03312fa3"), 'orderItem.materialId': "557ea7665d4b23a628325f5b"};
    //    var old = { _id: new BSON.ObjectID("558bdf6d7656a16c03312fa3") };
    var newData = {'orderItem.$.paidIn': '999'};
    //    var newData = { 'sum': '22' };
    //    mongodbDao.update(old, newData, 'Orders', function (err, data) {
    //        if (err) {
    //            console.info(err);
    //            return res.json({ err: err });
    //        } else {
    //            console.info(data);
    //            return res.json({ err: err });
    //        }
    //    });
    var queryArray = [];
    queryArray.push(mongodbDao.classUpdatePromise(old, newData, 'Orders'));
    Q.all(queryArray).then(function (success) {
        res.json({s: 1});
    });
}


//我的组员，设置确定权限页面
exports.setUserAuthPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('operations/login');
            } else {
                var id = req.query.id;
                mongodbDao.queryBy({_id: new BSON.ObjectID(id)}, "User", function (err, data) {
                    if (err) return res.render('/500');
                    res.render('common/setUserAuth', {
                        isConfirme: data[0].isConfirme,
                        uId: id
                    });
                });
            }
        }
    );
};

//我的组员，设置确定权限功能
exports.setUserAuth = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            //未登录
            return res.json({status: 201});
        } else {
            var isConfirme = req.body.userAuth;
            var _id = req.body._id;
            mongodbDao.queryBy({_id: new BSON.ObjectID(_id)}, "User", function (err, data) {
                if (err) return res.json({status: 500});
                if (data && data.length > 0) {
                    redisDao.getInstance().hset(data[0].openId, "isConfirme", isConfirme);
                    mongodbDao.update({_id: new BSON.ObjectID(_id)}, {isConfirme: isConfirme}, "User", function (err, user) {
                        if (err) {
                            return res.json({status: 500});
                        } else {
                            return res.json({status: 100});
                        }
                    });
                } else {
                    //没有该用户
                    return res.json({status: 101});
                }

            });

        }
    });
};

//我的成员
exports.myteamMember = function (req, res) {
    var mechanismId = req.query.mechanismId;
    userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('operations/login');
            } else {
                var headMechanismId = userInfo.headMechanismId;
                var mechanism_id = userInfo.mechanism_id;
                var type = userInfo.userType;
                var _startIdx = req.query.startIdx, _currentIdx;
                var name = req.query.name;
                if (!_startIdx) {
                    _startIdx = 0;
                } else {
                    _startIdx = parseInt(_startIdx);
                }
                _currentIdx = parseInt(_startIdx / 10 + 1);

                var supplyData = {};
                if (name && name != 'undefined') {
                    supplyData.name = name;
                }
                mongodbDao.pagingQuery({
                    mechanism_id: mechanismId,
                    userType: type
                }, 'User', {createdAt: -1}, _startIdx, _startIdx + 10, function (err, datas) {
                    var userArray = new Array();
                    if (err) {
                        return res.render('500');
                    } else {
                        if (!datas || datas.length == 0) {
                            userArray = [];
                        } else {
                            userArray = datas;
                        }
                        if(type==1){
                            return res.render('common/myteamMember', {
                                users: userArray,
                                _currentIdx: _currentIdx,
                                userType: userInfo.userType,
                                userAuth: userInfo.userAuth
                            });
                        }else if(type==2){
                            return res.render('common/myteamMember01', {
                                users: userArray,
                                _currentIdx: _currentIdx,
                                userType: userInfo.userType,
                                userAuth: userInfo.userAuth
                            });
                        }

                    }
                });
            }
        }
    );
}

//添加成员页面
exports.addUserPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var openId = userInfo.openId;
            mongodbDao.queryBy({openId: openId, userAuth: '1'}, 'User', function (err, data) {
                //只有mechanism_id与headMechanismId相等的时候才能证明这个人是总店的管理员  证明他是总店管理员才有邀请权限
                if (!!err) {
                    res.json({code: 1001});//系统问题
                } else if (data.length == 0) {
                    res.json({code: 1002});//这个人不是管理员
                } else if (data.length > 1) {
                    res.json({code: 1003});//系统数据库 数据错误
                } else if (data.length == 1 && mechanism_id == headMechanismId) {
                    var mechanism_id = data[0].mechanism_id;//机构ID
                    var headMechanismId = data[0].headMechanismId;//总店ID
                    //当前这个人是总店的管理员
                    mongodbDao.queryBy({_id: new BSON.ObjectID(headMechanismId)}, 'Restruant', function (err, data) {
                        if (!!err) {
                            res.json({code: 1001});//系统问题
                        } else {
                            var chainRest = data[0].chainStoredIds;
                            var crArray = [];
                            for (var i = 0; i < chainRest.length; i++) {
                                crArray.push(mongodbDao.classQueryPromise({_id: new BSON.ObjectID(chainRest[i])}, 'Restruant'));
                            }
                            Q.all(crArray).then(function (success) {
                                return res.json({data: success})
                            });
                        }
                    });
                } else {
                    res.json({code: 1003});
                }
            });
        }
    });
}
//添加组员
exports.addUser = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 201});
        } else {
            if (userInfo.userAuth == '1') {
                var userName = req.body.userName;
                var headMechanismId = req.body.headMechanismId;
                var mechanism_id = req.body.mechanism_id;
                if (userName) {
                    mongodbDao.update({userName: userName}, {
                        headMechanismId: headMechanismId,
                        mechanism_id: mechanism_id
                    }, 'User', function (err, data) {
                        if (err) {
                            return res.json({status: 500});
                        } else {
                            return res.json({status: 100});
                        }
                    });
                } else {
                    //用户名不能为空
                    return res.json({status: 400});
                }
            } else {
                //没有权限
                return res.json({status: 300})
            }
        }
    });
}

//我的朋友页面
exports.myfriendPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('operations/login');
            } else {
                mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, data) {
                    if (err) {
                        return res.render('500');
                    } else {
                        var myFriends = data[0].myFriends;
                        if (!myFriends) myFriends = [];
                        //数组方式的分页，缺点需要一次加载出来
                        var _startIdx = req.query.startIdx, _currentIdx;
                        if (!_startIdx) {
                            _startIdx = 0;
                        } else {
                            _startIdx = parseInt(_startIdx);
                        }
                        _currentIdx = parseInt(_startIdx / 10 + 1);
                        var queryArray = [];
                        for (; _startIdx < myFriends.length && _startIdx < (_startIdx + 10); _startIdx++) {
                            queryArray.push(mongodbDao.classQueryPromise({userName: myFriends[_startIdx]}, 'User'))
                        }
                        Q.all(queryArray).then(function (success) {
                            res.render('common/myfriend', {
                                friends: success,
                                _currentIdx: _currentIdx,
                                userType: userInfo.userType
                            });
                        });
                    }
                });
            }
        }
    );
}

//我的朋友添加页面
exports.addFriendPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            return res.render('common/addFriend');
        }
    });
}
exports.addFriend = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 201});
        } else {
            var userName = req.body.userName;
            if (userName) {
                mongodbDao.queryBy({userName: userInfo.userName}, 'User', function (err, data) {
                    if (err) {
                        return res.render('500');
                    } else {
                        if (data.length > 0) {
                            var myFriends = data[0].myFriends;
                            if (!myFriends) myFriends = [];
                            if (_.contains(myFriends, userName)) {
                                //用户已经在你的好友名单中
                                return res.json({status: 102});
                            } else {
                                myFriends.push(userName);
                                mongodbDao.update({userName: userInfo.userName}, {myFriends: myFriends}, 'User', function (err, data) {
                                    if (err) {
                                        return res.json({status: 500});
                                    } else {
                                        return res.json({status: 100});
                                    }
                                });
                            }
                        } else {
                            //该用户不存在
                            return res.json({status: 101});
                        }
                    }
                });
            } else {
                //用户名不能为空
                return res.json({status: 400});
            }
        }
    });
}

//接受邀请页面，由点击模版出来
//常用联系人邀请回调
exports.addContacts = function (req, res) {
    //userPromise(req, res).then(function (userInfo) {
    //        if (!userInfo) {
    //            return res.json({status: 201});
    //        } else {
    //接受者
    var accepter = req.query.accepter;
    //发送者
    var sender = req.query.sender;
    var accepterMid = req.query.accepterMid;
    var accepterHMid  = req.query.accepterHMid;
    var senderMid = req.query.senderMid;
    var senderHMid = req.query.senderHMid;
    var senderType = req.query.senderType;
    var accepterType = req.query.accepterType;
    var fcQueryArray = [];

    console.info('sender:'+sender);
    console.info('accepterMid:'+accepterMid);
    console.info('accepterHMid:'+accepterHMid);
    console.info('senderMid:'+senderMid);
    console.info('senderHMid:'+senderHMid);
    console.info('senderType:'+senderType);


    if(senderType=='1'){

        //接受者
        fcQueryArray.push(mongodbDao.classQueryPromise({mechanism_id: accepterMid,mechanism_type:'2'}, 'FrequentContacts'));
        //发送者
        fcQueryArray.push(mongodbDao.classQueryPromise({mechanism_id: senderHMid,mechanism_type:'1'}, 'FrequentContacts'));
    }else{

        //接受者
        fcQueryArray.push(mongodbDao.classQueryPromise({mechanism_id: accepterHMid,mechanism_type:'1'}, 'FrequentContacts'));
        //发送者
        fcQueryArray.push(mongodbDao.classQueryPromise({mechanism_id: senderMid,mechanism_type:'2'}, 'FrequentContacts'));
    }
    Q.all(fcQueryArray).then(function (success) {
        var fcUpdateArray = [];
        if (success == ',') {
            if(senderType=='1'){
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: accepterMid,
                    mechanism_type: accepterType,
                    contacts: [senderMid]
                }, 'FrequentContacts'));
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: senderHMid,
                    mechanism_type: senderType,
                    contacts: [accepterMid]
                }, 'FrequentContacts'));
            }else{
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: accepterHMid,
                    mechanism_type: accepterType,
                    contacts: [senderMid]
                }, 'FrequentContacts'));
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: senderHMid,
                    mechanism_type: senderType,
                    contacts: [accepterMid]
                }, 'FrequentContacts'));
            }

            //同步等待
            Q.all(fcUpdateArray).then(function (upDate) {
                return res.render('common/invitation01');
            });
        } else {
            var acceptFc = success[0][0];
            var sendFc = success[1][0];
            //接受者的处理
            if (acceptFc) {
                var contacts = acceptFc.contacts;
                if (!contacts) {
                    contacts = [];
                    contacts.push(senderMid);
                } else {
                    // 判断添加的联系人是否已经在你的常用联系人列表中
                    if (!_.contains(contacts, senderMid)) {
                        contacts.push(senderMid);
                    }
                }
                fcUpdateArray.push(mongodbDao.classUpdatePromise({_id: new BSON.ObjectID(acceptFc._id)}, {contacts: contacts}, 'FrequentContacts'));
            } else {
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: accepterMid,
                    mechanism_type: accepterType,
                    contacts: [senderMid]
                }, 'FrequentContacts'));
            }
            if (sendFc) {
                var contacts = sendFc.contacts;
                if (!contacts) {
                    contacts = [];
                    contacts.push(accepterMid);
                } else {
                    // 判断添加的联系人是否已经在你的常用联系人列表中
                    if (!_.contains(contacts, accepterMid)) {
                        contacts.push(accepterMid);
                    }
                }
                fcUpdateArray.push(mongodbDao.classUpdatePromise({_id: new BSON.ObjectID(sendFc._id)}, {contacts: contacts}, 'FrequentContacts'));
            } else {
                fcUpdateArray.push(mongodbDao.classSavePromise({
                    mechanism_id: senderMid,
                    mechanism_type: senderType,
                    contacts: [accepterMid]
                }, 'FrequentContacts'));
            }
            //同步等待
            Q.all(fcUpdateArray).then(function (upDate) {
                return res.render('common/invitation01');
            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
    //    }
    //}
    //);
};

//发送添加常用联系人通知
exports.sendContactsConfirm = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 201});
        } else {
            var toUserName = req.body.userName;
            mongodbDao.queryBy({userName: toUserName}, 'User', function (err, data) {
                if (err) {
                    res.json({status: 500});
                } else {
                    if (data.length > 0) {
                        var accepterMid = data[0].headMechanismId;
                        var senderMid = userInfo.headMechanismId;
                        var senderType = userInfo.userType;
                        var accepterType = data[0].userType;
                        sendMtemplate.sendMtemplate001(data[0].openId, userInfo.userName, toUserName, accepterMid, senderMid, senderType, accepterType);
                        return res.json({status: 100});
                    } else {
                        return res.json({status: 101});
                    }
                }
            });
        }
    });
}

//微信模版接受好友页面
exports.addContactsPage = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!!userInfo) {
            var sender = userInfo.openId;
            var senderHMid = userInfo.headMechanismId;
            var senderMid = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var senderType = userInfo.userType;
            var branchName = '餐厅';
            if (senderType == '1') {
                branchName = '供应商';
            }
            var isGuest = userInfo.isGuest;
            console.info('isGuest:' + isGuest);
            if (!isGuest) {
                logger.error("获取缓存中的isGuest错误，请检查缓存数据添加");
                return res.render('admin/remind01', {msg: "抱歉！系统错误"});
            } else if (isGuest == 0) {
                return res.render('admin/remind01', {msg: "抱歉！由于你选择的是随便看看，所以没有添加操作的权限，请选择免费使用"});
            }
            else if (isGuest == 1) {
                //if (userInfo.userAuth != 1) {
                //    return res.render('admin/remind01', {msg: "抱歉！由于你不是管理员，所以不能做添加操作"});
                //}else {
                    return res.render('common/addContacts', {
                        senderHMid:senderHMid,
                        senderMid: senderMid,
                        sender: sender,
                        senderType: senderType,
                        userType: userInfo.userType,
                        openId: userInfo.openId,
                        branchName: branchName,
                        mechanism_name: mechanism_name
                    });
                }
            }
        //}
    });
}

/**
 * 订单模板获取订单信息
 * @param req
 * @param res
 */
exports.getOrderByIdModel = function (req, res) {
    var isHead = req.query.isHead ? req.query.isHead : 'false';
    var openId = req.query.openId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/noheadLogin');
        } else {
            var orderId = req.query.ordId;
            var orderSearch = {_id: BSON.ObjectID(orderId)};
            mongodbDao.queryBy(orderSearch, 'Orders', function (err, feed) {
                if (err) {
                    console.log(err);
                }else if(!feed){
                    logger.log('orderId为'+orderId+'的订单数据库查询出错');
                    return res.render("admin/remind",{msg:'系统错误'});
                }
                else if(feed.length==0){
                    return res.render("admin/remind",{msg:'该订单已被恶意删除！'});
                }
                else if(feed.length==1){
                    if (userInfo.userType == '2') { //如果是供应商
                        if (feed[0].orderStatus == 'N') {
                            return res.render("common/preparingSending", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        } else if (feed[0].orderStatus == 'R') {
                            res.render("common/list_detalis_sampledCom", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        }
                        else {
                            res.render("common/list_detalis", {ordersDetail: feed, isHead: isHead, openId: openId});
                        }
                    } else {
                        if (feed[0].orderStatus == 'S') {//已经配送
                            res.render("common/confirmeReceived", {ordersDetail: feed, isHead: isHead, openId: openId}); //跳转到确认收货页面
                        } else if (feed[0].orderStatus == 'R') {
                            res.render("common/list_detalis_sampledCom", {
                                ordersDetail: feed,
                                isHead: isHead,
                                openId: openId
                            });
                        }
                        else {
                            res.render("common/list_detalis", {ordersDetail: feed, isHead: isHead, openId: openId});
                        }
                    }
                }else{
                    logger.log('orderId为'+orderId+'的订单数据库有多条纪录')
                }
            });
        }
    });
}


/**
 * 生成订单号方法
 */
function getOrderNo() {
    var m = 10000000;
    var n = 99999999;
    var date = new Date();
    var newdate = commonUtil.formatDate(date, 'yyyyMMddhhmmss');
    var number = Math.round(Math.random() * (n - m) + m);
    var orderNo = 'E' + newdate + number;
    return orderNo
}

exports.getOrderNo = getOrderNo;


//订单模板发送
function sendOrderTemplate(orderId) {
    mongodbDao.queryBy({_id: new BSON.ObjectID(orderId)}, 'Orders', function (err, datas) {
        if (datas.length > 0) {
            var order = datas[0];
            var supplyId = order.toSupply;
            var receiverAddress = order.receiverAddress;
            var sum = order.sum;
            var orderStatus = order.orderStatus;
            var supplyName = order.supplyName;
            var restruantName = order.restruantName;
            var orderNo = order.orderNo;
            //获取供应商管理员信息
            Q.nfcall(mongodbDao.queryBy, {
                userType: '2',
                userAuth: '1',
                mechanism_id: supplyId
            }, 'User').then(function (datas) {
                if (datas && datas.length > 0) {
                    datas.forEach(function (user) {
                        sendMtemplate.sendMtemplate004(orderId, user.openId, receiverAddress, sum, orderStatus, supplyName, restruantName, orderNo);
                    });
                }
            });
        }
    });
}
exports.sendOrderTemplate = sendOrderTemplate;


//订单配送模板发送
function sendOrderTemplate005(orderId){
    mongodbDao.queryBy({_id: new BSON.ObjectID(orderId)}, 'Orders', function (err, datas) {
        if (datas.length > 0) {
            var order = datas[0];
            var restruantId = order.restruantId;
            var receiverAddress = order.receiverAddress;
            var sum = order.sum;
            var orderStatus = order.orderStatus;
            var supplyName = order.supplyName;
            var restruantName = order.restruantName;
            var orderNo = order.orderNo;
            //查询总餐厅id
            queryHeadRestruant(restruantId).then(function (restruantHeadId) {
                //获取供应商管理员信息
                var restruantIdArray = new Array();
                if(restruantId!=restruantHeadId){
                    restruantIdArray.push(restruantHeadId.toString());
                }
                restruantIdArray.push(restruantId.toString());
                Q.nfcall(mongodbDao.queryBy,{
                    userType: '1',
                    userAuth: '1',
                    mechanism_id: {$in:restruantIdArray}
                },'User').then(function (datas) {
                    console.info('datas:'+JSON.stringify(datas));
                    if(datas && datas.length > 0) {
                        datas.forEach(function (user){
                            sendMtemplate.sendMtemplate005(orderId, user.openId, receiverAddress, sum, orderStatus, supplyName, restruantName, orderNo);
                        });
                    }
                });
            });
        }
    });
}
exports.sendOrderTemplate005 = sendOrderTemplate005;

//订单确认收获模板发送
function sendOrderTemplate006(orderId) {
    mongodbDao.queryBy({_id: new BSON.ObjectID(orderId)}, 'Orders', function (err, datas) {
        if (datas.length > 0) {
            var order = datas[0];
            var supplyId = order.toSupply;
            var receiverAddress = order.receiverAddress;
            var sum = order.sum;
            var orderStatus = order.orderStatus;
            var supplyName = order.supplyName;
            var restruantName = order.restruantName;
            var orderNo = order.orderNo;
            //获取供应商管理员信息
            Q.nfcall(mongodbDao.queryBy, {
                userType: '2',
                userAuth: '1',
                mechanism_id: supplyId
            }, 'User').then(function (datas) {
                if (datas && datas.length > 0) {
                    datas.forEach(function (user) {
                        sendMtemplate.sendMtemplate006(orderId, user.openId, receiverAddress, sum, orderStatus, supplyName, restruantName, orderNo);
                    });
                }
            });
        }
    });
}
exports.sendOrderTemplate006 = sendOrderTemplate006;


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
                    materials.forEach(function (material) {
                        if (material.isInquery == '1') {
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
 * 处理询价单模版
 * @param req
 * @param res
 */
exports.qryInqueryById = function (req, res) {
    var inquerySheetId = req.query.oId;
    var openId = req.query.openId;
    var isHead = req.query.isHead ? req.query.isHead : 'false';

    qryInqueryByIdPromis(req, res, inquerySheetId).then(function (offerSheetData) {
        var materialIds = new Array();
        if (offerSheetData.start === '1') {
            return res.render('admin/remind', {msg: '该模板已过期或该订单已经报价！'});
        }
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
                    return res.render('common/offerConfirmCommon', {
                        offerSheetData: JSON.stringify(offerSheetData),
                        inquerySheetId: inquerySheetId,
                        openId: openId,
                        isHead: isHead
                    });
                });
            } else {
                return res.render('common/offerConfirmCommon', {
                    offerSheetData: JSON.stringify(offerSheetData),
                    inquerySheetId: inquerySheetId,
                    openId: openId,
                    isHead: isHead
                });
            }
        });
    });
}


/**
 * 根据报价单id查询报价单信息
 * @param req
 * @param res
 */
exports.qryOfferSheetById = function (req, res) {
//查询常用联系人
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var offerSheetId = req.query.offerSheetId;
            var supplyName = req.query.supplyName;
            var openId = req.query.openId;
            var isHead = req.query.isHead ? req.query.isHead : 'false';
            Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(offerSheetId)}, 'OfferSheet').then(function (offerSheets) {
                if (offerSheets) {
                    var offerSheet = offerSheets[0];
                    //判断当前报价单是否以报价（下单），若果是则提示以报价不能重新操作
                    if (offerSheet.start === '2') {
                        return res.render('admin/remind', {msg: '该订单已经下单！'});
                    }

                    var materialIds = new Array();
                    var materalArray = new Array();
                    offerSheet.materials.forEach(function (material) {
                        if (material.isOffer === '1') {
                            materialIds.push(material.material_id.toString());
                            materalArray.push(material);
                        }
                    });
                    offerSheet.materials = materalArray;
                    //获取食材历史纪录，
                    offerSheetService.queryMaterialHis(userInfo.mechanism_id, userInfo.userType, materialIds).then(function (materials) {
                        //materials.forEach(function (material) {
                        //    offerSheet.materials.forEach(function (offerMaterial) {
                        //        offerMaterial.number = '0.00';
                        //        if (offerMaterial.material_id === material.materialId) {
                        //            offerMaterial.number = material.number
                        //        }
                        //    });
                        //});
                        res.render('common/list_confirm_p07Common', {
                            title: '下单',
                            offerSheet: JSON.stringify(offerSheet),
                            supplyName: supplyName,
                            openId: openId,
                            isHead: isHead
                        });
                    });
                } else {
                    console.log('数据库查询出错！');
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

                //判断使是否为总店，如股票ishead 为1，则该餐厅为总店
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
                                return res.render('common/distInformationCommon', {
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
                        return res.render('common/distInformationCommon', {
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

                    return res.render('common/distInformationCommon', {
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

//根据分餐厅ID查询总餐厅Id
function queryHeadRestruant(restruantId) {
   return Q.Promise(function (resolve, reject) {
        mongodbDao.queryBy({chainStoredIds: {$in: [restruantId]}}, 'Restruant', function (err, restruants) {
            console.info('restruants:'+JSON.stringify(restruants));
            if (err) {
                return reject(err);
            }
            //若果长度为0，表示该餐厅为总店
            else if (restruants.length == 0) {
                return resolve(restruantId);
            } else {
                return resolve(restruants[0]._id);
            }
        });
    });
}

//个人关注食材
exports.updateFavMetrial = function(req,res){
    var materialId = req.body.materialId;
    var isFav = req.body.isFav;
    userPromise(req,res).then(function(userInfo){
        var userId = userInfo.id;
        //判断是否关注食材
        console.info(userId);
        if(isFav==='true'){

            mongodbDao.updateNotset({_id:new BSON.ObjectID(userId)}, {$addToSet: {favMetrial: materialId}},'User',function(err,result){
                console.info(JSON.stringify(result));
                if(!result){
                    console.log('关注该食材失败');
                    return res.json({code:500});
                }else if(result == 1){
                    return res.json({code:100});
                }else{
                    return res.json({code:500});
                }
        });
        }else{

            mongodbDao.updateNotset({_id:new BSON.ObjectID(userId)}, {$pull: {favMetrial: materialId}},'User',function(err,result){
                console.info(JSON.stringify(result));
                if(!result){
                    console.log('关注该食材失败');
                    return res.json({code:500});
                }else if(result == 1){
                    return res.json({code:100});
                }else {
                    return res.json({code:500});
                }
            });
        }
    });
}

exports.redisHget = function(key, field) {
    var deferred = Q.defer();
    if (typeof (key) == 'undefined') {
        deferred.reject('redis hget meet a error of key is undefined');
    } else {
        redisDao.getInstance().hget(key, field, function (err, cacheData) {
            if (err) deferred.reject(new Error(err));
            deferred.resolve(cacheData);
        });
    }
    return deferred.promise;
}


