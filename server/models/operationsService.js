//运营商部分服务

var config = require('../../config');
var mongodbDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var underscore = require('underscore');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();
var userPromise = require('./userService').cmsPromise; //cms 管理系统
var nodeExcel = require('excel-export');
var Decimal = require('decimal');


exports.cmsGetSupply = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var supplyName = req.query.name;
            var isAvab = req.query.isAvab;
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _endIdx = _startIdx + 10;
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            if (supplyName && supplyName != 'undefined') {
                supplyData.name = {$regex:supplyName};
            }
            if (isAvab) {
                if (isAvab === '0') {
                    supplyData.isAvab = 'false';
                } else {
                    supplyData.isAvab = {$ne: 'false'};
                }
            }
            mongodbDao.pagingQuery(supplyData, 'Supply', {createdAt: -1}, _startIdx, _endIdx, function (err, data) {
                if (!!err) {
                    logger.error("error: " + err);
                    return reject(err);
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].createdAt = commonUtil.formatDate(data[i].createdAt, 'yyyy-M-d');
                }
                supplyName = supplyName ? supplyName : '';
                isAvab = isAvab ? isAvab : '';
                mongodbDao.getCount(supplyData, 'Supply', function (err, sum) {
                    res.render('operations/supplyMng', {
                        data: data,
                        userInfo: userInfo,
                        currentIdx: _currentIdx,
                        sum: sum,
                        startIdx: (_startIdx + 1),
                        name: supplyName,
                        parentId: 1,
                        childId: 11,
                        isAvab: isAvab
                    });
                });

            });
        }
    });
};

exports.cmsDelSupply = function (req, res) {
    var id = req.body.id;
    var avaliable = req.body.isAvab;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.update({_id: new BSON.ObjectID(id)}, {isAvab: avaliable}, 'Supply', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

exports.cmsGetRestaurant = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var name = req.query.name;
            var isAvab = req.query.isAvab;
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _endIdx = _startIdx + 10;
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            if (name && name != 'undefined') {
                supplyData.name = {$regex:name};
            }
            //supplyData.isHead = '1';
            if (isAvab) {
                if (isAvab === '0') {
                    supplyData.isAvab = 'false';
                } else {
                    supplyData.isAvab = {$ne: 'false'};
                }
            }
            mongodbDao.pagingQuery(supplyData, 'Restruant', {createdAt: -1}, _startIdx, _endIdx, function (err, data) {
                if (!!err) {
                    logger.error("error: " + err);
                    return reject(err);
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].createdAt = commonUtil.formatDate(data[i].createdAt, 'yyyy-M-d');
                }
                name = name ? name : '';
                isAvab = isAvab ? isAvab : '';
                mongodbDao.getCount(supplyData, 'Restruant', function (err, sum) {
                    res.render('operations/restaurantMng', {
                        data: data,
                        userInfo: userInfo,
                        currentIdx: _currentIdx,
                        sum: sum,
                        startIdx: (_startIdx + 1),
                        name: name,
                        parentId: 1,
                        childId: 12,
                        isAvab: isAvab
                    });
                });

            });
        }
    });
};

exports.cmsGetCategory = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var name = req.query.name;
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _endIdx = _startIdx + 10;
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            if (name && name != 'undefined') {
                supplyData.name = {$regex:name};
            }
            mongodbDao.pagingQuery(supplyData, 'Category', {seqNo: 1}, _startIdx, _endIdx, function (err, data) {
                if (!!err) {
                    logger.error("error: " + err);
                    return reject(err);
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].createdAt = commonUtil.formatDate(data[i].createdAt, 'yyyy-M-d');
                }
                mongodbDao.getCount(supplyData, 'Category', function (err, sum) {
                    if (err) {
                        logger.error("error:" + err);
                    }
                    mongodbDao.queryAdv('Category', {}, {seqNo: 1}, {seqNo: -1}, function (err, seqNo) {
                        if (err) {
                            logger.error("error:" + err);
                        }
                        var vSeqNo = seqNo[0].seqNo;
                        name = name ? name : '';
                        res.render('operations/categoryMng', {
                            data: data,
                            userInfo: userInfo,
                            currentIdx: _currentIdx,
                            sum: sum,
                            startIdx: (_startIdx + 1),
                            name: name,
                            parentId: 2,
                            childId: 22,
                            maxSeqNo: vSeqNo
                        });

                    })
                });

            });
        }
    });
};

exports.cmsGetPrice = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var name = req.query.name;
            var category = req.query.category;

            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            supplyData.isCustomer = {$ne: '1'};
            if (name && name != 'undefined') {
                supplyData.name = {$regex:name};
            }
            if (category) {
                supplyData.categoryId = category
            }
            var queryArray = [];
            queryArray.push(mongodbDao.classQueryPromise({}, 'Category'));
            queryArray.push(mongodbDao.pagingQueryPromise(supplyData, 'Material', _startIdx, 10));
            queryArray.push(mongodbDao.countQueryPromise(supplyData, 'Material'));
            Q.all(queryArray).then(function (success) {
                var categorys = success[0];
                var materials = success[1];
                for (var i = 0; i < materials.length; i++) {
                    materials[i].createdAt = commonUtil.formatDate(materials[i].createdAt, 'yyyy-M-d');
                }
                name = name ? name : '';
                category = category?category:'';
                res.render('operations/priceMng', {
                    categorys: categorys,
                    materials: materials,
                    userInfo: userInfo,
                    currentIdx: _currentIdx,
                    sum: success[2],
                    startIdx: (_startIdx + 1),
                    name: name,
                    parentId: 2,
                    childId: 23,
                    categoryId: category
                });
            });

        }
    });
};

exports.cmsDelPrice = function (req, res) {
    var id = req.body.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.remove({_id: new BSON.ObjectID(id)}, 'Material', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

exports.cmsAddPrice = function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var categoryId = req.body.categoryId;
    var categoryName = req.body.categoryName;
    var remark = req.body.remark;
    var unit = req.body.unit;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.save({
                name: name,
                price: price,
                categoryId: categoryId,
                categoryName: categoryName,
                remark: remark,
                unit: unit
            }, 'Material', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

/**
 * 食材更新操作
 * @param req
 * @param res
 */
exports.cmsUpdatePrice = function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var categoryId = req.body.categoryId;
    var categoryName = req.body.categoryName;
    var remark = req.body.remark;
    var unit = req.body.unit;
    var isCustomer = req.body.isCustomer;
    console.info('price:' + price);
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            if(isCustomer=='1'){
                var data = {
                    name: name,
                    minPrice: price,
                    categoryId: categoryId,
                    categoryName: categoryName,
                    remark: remark,
                    unit: unit
                }
            }else{
                var data = {
                    name: name,
                    price: price,
                    categoryId: categoryId,
                    categoryName: categoryName,
                    remark: remark,
                    unit: unit
                }
            }
            console.info(data);
            mongodbDao.update({ _id: new BSON.ObjectID(id)},data, 'Material', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};


exports.cmsAddCategory = function (req, res) {
    var newData = {};
    newData.name = req.body.name;
    newData.seqNo = parseInt(req.body.seqNo);
    var objId = req.body.objId;
    var searchQ = {}
    searchQ.name = newData.name;
    if (!objId) {
        //newData._id=new BSON.ObjectID(objId);
        //searchQ._id=objId;
        //newData._id=objId;
    }


    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.updateOrSave(searchQ, newData
                , 'Category', function (err, data) {
                    if (err) {
                        return res.json({status: 500});
                    } else {
                        return res.json({status: 100});
                    }
                });
        }
    });
};

//禁用餐厅
exports.cmsDelRestruant = function (req, res) {
    var id = req.body.id;
    var avaliable = req.body.isAvab;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            //
            mongodbDao.update({_id: new BSON.ObjectID(id)}, {isAvab: avaliable}, 'Restruant', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

exports.cmsDelCategory = function (req, res) {
    var id = req.body.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.remove({_id: new BSON.ObjectID(id)}, 'Category', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

exports.cmsQueryOrder = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var name = req.query.name;
            var orderNo = req.query.orderId;
            var startDate = req.query.startDate;
            var endDate = req.query.endDate;
            var orderStatus = req.query.status;
            var resName = req.query.resName;
            var resId = req.query.resId;
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _endIdx = _startIdx + 10;
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            if (orderStatus && orderStatus != 'All') {
                supplyData.orderStatus = orderStatus;
            }
            //var enddate="2016-06-30"
            //var startDate="2015-06-24";
            if (name && name != 'undefined') {
                if (userInfo.userType == 1) {
                    supplyData.supplyName = {$regex: name};
                } else if (userInfo.userType == 2) {
                    supplyData.restruantName = {$regex: name};
                }
            }
            if (orderNo && orderNo != 'undefined') {
                supplyData.orderNo = {$regex: orderNo};
            }
            if (userInfo.userType == 1) {
                if (resId) {
                    supplyData.restruantId = resId
                } else {
                    supplyData.restruantId = userInfo.mechanism_id
                }


            } else if (userInfo.userType == 2) {
                supplyData.toSupply = userInfo.mechanism_id
            }
            if (startDate || endDate) {
                supplyData.createdAt = {};
                if (startDate) {
                    startDate = new Date(startDate);
                    //startDate = new Date(Date.parse(startDate.replace(/-/g, "/"))); //转换成Data();
                    supplyData.createdAt.$gte = startDate;
                }
                if (endDate) {
                    var newendDate = new Date(endDate);
                    endDate = new Date(endDate);
                    //endDate = new Date(Date.parse(endDate.replace(/-/g, "/"))); //转换成Data();
                    newendDate.setDate(newendDate.getDate() + 1);
                    supplyData.createdAt.$lte = newendDate;
                }
            }
            var queryId = {};
            queryId._id = new BSON.ObjectID(userInfo.mechanism_id);

            console.info('queryId:' + queryId);
            Q.nfcall(mongodbDao.queryBy, queryId, 'Restruant').then(function (restruants) {
                console.info('restruants:' + restruants);
                var restruantIdArray = new Array();
                if (userInfo.userType == 1) {
                    restruantIdArray.push(userInfo.mechanism_id);
                    if (restruants[0].isHead == '1') {
                        restruants[0].chainStoredIds.forEach(function (chainStoredId) {
                            restruantIdArray.push(chainStoredId);
                        });
                    }
                    return restruantIdArray;
                } else {
                    return null;
                }
            }).then(function (IdArray) {
                if (IdArray) {
                    if (!resId) {
                        supplyData.restruantId = {$in: IdArray};
                    }
                }
                console.info('supplyData:' + JSON.stringify(supplyData));

                mongodbDao.pagingQuery(supplyData, 'Orders', {createdAt: -1}, _startIdx, _endIdx, function (err, data) {
                    if (!!err) {
                        logger.error("error: " + err);
                        return reject(err);
                    }
                    var totalNumber = 0;
                    var paidInTotalNumber = 0;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].createdAt)
                            data[i].createdAt = commonUtil.formatDate(data[i].createdAt, 'yyyy-M-d');
                        var materials = data[i].orderItem;
                        var subSum = 0;
                        var paidIn_Sum = 0;
                        materials.forEach(function (material) {
                            var materialPrice = material.materialPrice ? material.materialPrice : '0';
                            var number = material.number ? material.number : '0';
                            var paidIn = material.paidIn ? material.paidIn : '0';
                            var sum = Decimal(materialPrice).mul(Decimal(number));
                            var paidInSum = Decimal(materialPrice).mul(Decimal(paidIn));
                            subSum = Decimal(subSum).add(Decimal(sum));
                            paidIn_Sum = Decimal(paidIn_Sum).add(Decimal(paidInSum));
                        });
                        data[i].sum = subSum;
                        data[i].paidIn_Sum = paidIn_Sum;
                        totalNumber = Decimal(totalNumber).add(Decimal(subSum));
                        paidInTotalNumber = Decimal(paidInTotalNumber).add(Decimal(paidIn_Sum));
                    }
                    orderNo = orderNo ? orderNo : '';
                    orderStatus = orderStatus ? orderStatus : '';
                    name = name ? name : '';
                    resName = resName ? resName : '';
                    resId = resId ? resId : '';
                    var searchField;
                    var serchData = {};
                    if (userInfo.userType == 1) {
                        searchField = 'supplyName'
                        serchData.restruantId = userInfo.mechanism_id;
                    } else if (userInfo.userType == 2) {
                        searchField = 'restruantName'
                        serchData.toSupply = userInfo.mechanism_id;
                    }

                    startDate = commonUtil.formatDate(startDate, 'MM/dd/yyyy');
                    endDate = commonUtil.formatDate(endDate, 'MM/dd/yyyy');
                    mongodbDao.getCount(supplyData, 'Orders', function (err, sum) {
                        mongodbDao.distinctQuery(serchData, searchField, 'Orders', function (err, suppColl) {
                            var url;
                            if (userInfo.userType == 1) {
                                //查询餐厅以及子餐厅
                                var restruantIdArray = new Array();
                                var resArray = new Array();
                                mongodbDao.queryBy({_id: new BSON.ObjectID(userInfo.mechanism_id)}, 'Restruant', function (err, restruants) {
                                    resArray.push({id: restruants[0]._id.toString(), name: restruants[0].name});

                                    if (restruants[0].isHead == '1') {
                                        restruants[0].chainStoredIds.forEach(function (chainStoredId) {
                                            restruantIdArray.push(new BSON.ObjectID(chainStoredId));
                                        });

                                        mongodbDao.queryBy({_id: {$in: restruantIdArray}}, 'Restruant', function (err, restruantArray) {
                                            restruantArray.forEach(function (restruant) {
                                                resArray.push({id: restruant._id.toString(), name: restruant.name});
                                            });
                                            url = 'operations/orderQueryForR';
                                            return res.render(url, {
                                                data: data,
                                                userInfo: userInfo,
                                                currentIdx: _currentIdx,
                                                sum: sum,
                                                startIdx: (_startIdx + 1),
                                                name: name,
                                                parentId: 3,
                                                childId: 32,
                                                orderStatus: orderStatus,
                                                startDate: startDate,
                                                endDate: endDate,
                                                orderNo: orderNo,
                                                totalNumber: totalNumber,
                                                paidInTotalNumber: paidInTotalNumber,
                                                suppColl: suppColl,
                                                restruantArray: resArray,
                                                resName: resName,
                                                resId: resId
                                            });
                                        });
                                    } else {
                                        url = 'operations/orderQueryForR';
                                        return res.render(url, {
                                            data: data,
                                            userInfo: userInfo,
                                            currentIdx: _currentIdx,
                                            sum: sum,
                                            startIdx: (_startIdx + 1),
                                            name: name,
                                            parentId: 3,
                                            childId: 32,
                                            orderStatus: orderStatus,
                                            startDate: startDate,
                                            endDate: endDate,
                                            orderNo: orderNo,
                                            totalNumber: totalNumber,
                                            paidInTotalNumber: paidInTotalNumber,
                                            suppColl: suppColl,
                                            restruantArray: resArray,
                                            resName: resName,
                                            resId: resId
                                        });
                                    }
                                })
                            } else {
                                url = 'operations/orderQuery';
                                return res.render(url, {
                                    data: data,
                                    userInfo: userInfo,
                                    currentIdx: _currentIdx,
                                    sum: sum,
                                    startIdx: (_startIdx + 1),
                                    name: name,
                                    parentId: 3,
                                    childId: 32,
                                    orderStatus: orderStatus,
                                    startDate: startDate,
                                    endDate: endDate,
                                    orderNo: orderNo,
                                    totalNumber: totalNumber,
                                    paidInTotalNumber: paidInTotalNumber,
                                    suppColl: suppColl
                                });
                            }
                        });
                    });
                });
            });
        }
    });
}


exports.cmsLogin = function (req, res) {
    res.render('operations/login', {parentId: 0, childId: 1});
};

exports.login = function (req, res) {
    var sessionId = req.sessionID;
    var userName = req.body.userName;
    var password = req.body.passWord;
    var data = {userName: userName};
    mongodbDao.queryBy(data, 'User', function (err, data) {
        if (err) {
            logger.error("数据库操作出问题");
            return res.render('operations/login', {parentId: 0, childId: 1});
        } else if (data && data.length == 0) {
            return res.render('operations/login', {parentId: 0, childId: 1});
        } else if (data && data.length > 1) {
            logger.error("There are over one more users registered in ID " + userName + "! please find out the reason ASAP.");
            return res.render('operations/login', {parentId: 0, childId: 1});
        } else {
            var userInfo = data[0];

            if (userInfo.userAuth == '1') {
                if (password == data[0].password) {
                    redisDao.getInstance().hset(sessionId, 'userType', userInfo.userType);
                    redisDao.getInstance().hset(sessionId, 'userAuth', userInfo.userAuth);
                    redisDao.getInstance().hset(sessionId, 'userName', userInfo.userName);
                    redisDao.getInstance().hset(sessionId, 'mechanism_id', userInfo.mechanism_id ? userInfo.mechanism_id : "");
                    redisDao.getInstance().hset(sessionId, 'mechanism_name', userInfo.mechanism_name ? userInfo.mechanism_name : "");
                    redisDao.getInstance().expire(sessionId, 36000);
                    if (userInfo.userType != '0') {
                        //如果是非平台运营者,直接跳转到自定义菜品页面
                        return res.redirect('/cmsGetCustMetiral');

                    } else {
                        return res.redirect('/cmsGetSupply'); //如果是平台运营者
                    }
                } else {
                    return res.render('operations/login', {parentId: 0, childId: 1});
                }
            } else {
                return res.render('operations/login', {parentId: 0, childId: 1});
            }
        }


    });
}

exports.logout = function (req, res) {
    //redis中去除sessionID
    redisDao.getInstance().del(req.sessionID);
    res.redirect("/cmsLogin");
}

exports.register = function (req, res) {
    //    var userName = 'admin';
    //    var password = 'admin';
    //var userName = req.body.userName;
    //var password = req.body.passWord;
    var userData = {userName: userName, password: password, type: '0'};
    if (userName) {
        mongodbDao.queryBy({userName: userName}, 'User', function (err, data) {
            if (!!err) {
                logger.error("数据库操作出问题");
            } else if (data && data.length == 1) {
                return res.render('operations/login');
            } else if (data && data.length == 0) {
                mongodbDao.save(userData, 'User', function (err, data1) {
                    if (!!err) {
                        logger.error('数据库操作问题');
                        return res.render('operations/login', {parentId: 0, childId: 1});
                    } else {
                        return res.redirect('/index');
                    }
                });
            }
        });
    }
};

exports.cmsShowMateriesInfo = function (req, res) {
    var id = req.query.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(id)}, 'Material', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100, data: data[0]});
                }
            });
        }
    });
}

exports.cmsShowCategoryInfo = function (req, res) {
    var id = req.query.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(id)}, 'Category', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100, data: data[0]});
                }
            });
        }
    });
}

exports.cmsTemplateMng = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var name = req.query.name;
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var supplyData = {};
            if (name && name != 'undefined') {
                supplyData.name = name;
            }
            supplyData.mechanism_id = 'A';
            var queryArray = [];
            queryArray.push(mongodbDao.pagingQueryPromise(supplyData, 'Template', _startIdx, 10));
            queryArray.push(mongodbDao.countQueryPromise(supplyData, 'Template'));
            Q.all(queryArray).then(function (success) {
                var templates = success[0];
                var sum = success[1];
                for (var i = 0; i < templates.length; i++) {
                    templates[i].createdAt = commonUtil.formatDate(templates[i].createdAt, 'yyyy-M-d');
                }
                res.render('operations/templateMng', {
                    data: templates,
                    userInfo: userInfo,
                    currentIdx: _currentIdx,
                    sum: sum,
                    startIdx: (_startIdx + 1),
                    name: name,
                    parentId: 2,
                    childId: 21
                });
            });

        }
    });
}

exports.cmsDelTemplate = function (req, res) {
    var id = req.body.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.remove({_id: new BSON.ObjectID(id)}, 'Template', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};
exports.cmsTemplateAdd = function (req, res) {
    Q.all([Q.nfcall(mongodbDao.queryBy, {}, 'Category'),
        Q.nfcall(mongodbDao.queryBy, {}, 'Material')]).then(function (feel) {

        if (feel == ',') {
            console.log('并行查询结果都为空');
            return res.render('restaurant/template/add_template', {title: "添加模版", categorys: [], materials: []});
        }

        var categorys = feel[0];
        var materials = feel[1];
        if (categorys.length == 0) {
            console.log('没有食材类别信息');
        }
        return res.render('operations/cmsTemplateAdd', {title: "添加模版", categorys: categorys, materials: materials});
    }).done(null, function (err) {
        console.log(err);
    });
};

exports.cmsAddTemplate = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            var materials = req.body.materialsString;
            materials = JSON.parse(materials);
            var mdata = materials.materials;
            var templateName = materials.name;
            var idArray = new Array();
            mdata.forEach(function (material) {
                idArray.push(material.id);
            });
            var templateData = {
                name: templateName,
                materials: idArray,
                mechanism_id: 'A'
            };
            //判断是否为餐厅用户
            mongodbDao.save(templateData, 'Template', function (err, data) {
                if (err) {
                    logger.error('数据库操作问题');
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
            ////判

        }
    });

}

exports.getResturantDetials = function (req, res) {
    userPromise(req, res).then(function (userinfo) {
        if (!userinfo) {
            return res.json({status: 200});
        } else {
            var resturanId = req.body.id;
            mongodbDao.queryBy({_id: new BSON.ObjectID(resturanId)}, 'Restruant', function (err, data) {
                if (err) {
                    console.log(err);
                    return res.json(err);
                } else {
                    var resturantObj = {};
                    resturantObj.name = data[0].name;
                    resturantObj.telephone = data[0].telephone;
                    resturantObj.address = data[0].address;
                    resturantObj.area = data[0].area;
                    resturantObj.chainStores = [];
                    var chainStoreIds = data[0].chainStoredIds;
                    var chainOid = [];
                    if (chainStoreIds) {
                        for (var i = 0; i < chainStoreIds.length; i++) {
                            chainOid.push(new BSON.ObjectID(chainStoreIds[i]));
                        }
                    }
                    mongodbDao.queryBy({_id: {$in: chainOid}}, "Restruant", function (err, data) {
                        if (err) {
                            return res.json(err);
                        } else {
                            for (var i = 0; i < data.length; i++) {
                                var obj = {};
                                obj.name = data[i].name;
                                obj.telephone = data[0].telephone;
                                obj.address = data[0].address;
                                obj.area = data[0].area;
                                resturantObj.chainStores.push(obj);
                            }
                        }
                        return res.json(resturantObj);
                    });
                }
            });
        }
    });
}

exports.getSupplyDetials = function (req, res) {
    var supId = req.body.supId;
    userPromise(req, res).then(function (userinfo) {
        if (!userinfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(supId)}, 'Supply', function (err, data) {
                if (err) {
                    return res.json(err);
                } else {

                    return res.json(data[0]);
                }
            });

        }
    });
}

exports.getOrderDetails = function (req, res) {
    var oId = req.body.orderId;
    userPromise(req, res).then(function (userinfo) {
        if (!userinfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(oId)}, 'Orders', function (err, data) {
                if (err) {
                    return res.json(err);
                } else {
                    return res.json(data[0]);
                }
            });

        }
    });
}

exports.printOrder = function (req, res) {
    var oId = req.body.orderId;
    userPromise(req, res).then(function (userinfo) {
        if (!userinfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(oId)}, 'Orders', function (err, feed) {
                var data = feed[0].orderItem;
                console.info(feed[0]);
                if (err) {
                    return res.json(err);
                } else {
                    var conf = {};
                    if (feed[0].orderStatus != 'R') {
                        conf.cols = [
                            {caption: '编号', type: 'number', width: 23.0},
                            {caption: '名字', type: 'string', width: 20.85},
                            {caption: '价格', type: 'number', width: 20.85},
                            {caption: '订购数量', type: 'number', width: 20.85},
                            {caption: '订购总价', type: 'number', width: 30}];

                    } else {
                        conf.cols = [
                            {caption: '编号', type: 'number', width: 23.0},
                            {caption: '名字', type: 'string', width: 20.85},
                            {caption: '价格', type: 'number', width: 20.85},
                            {caption: '订购数量', type: 'number', width: 20.85},
                            {caption: '订购总价', type: 'number', width: 30},
                            {caption: '实收数量', type: 'number', width: 20.85},
                            {caption: '实收总价', type: 'number', width: 30}];
                    }
                    conf.rows = [];
                    var seq = 0, sum = 0, paidIn_orderSum = 0;
                    if (data && data.length >= 1) {
                        for (var i = 0; i < data.length; i++) {
                            var obj = data[i];
                            var row = [];
                            var materialName = obj.materialName;
                            var materialPrice = !obj.materialPrice ? '0' : obj.materialPrice;
                            var number = !obj.number ? '0' : obj.number;
                            var paidIn = !obj.paidIn ? '0' : obj.paidIn;
                            seq++;
                            row.push(seq);
                            row.push(materialName);
                            row.push(materialPrice);
                            row.push(number);
                            var subsum = Decimal(materialPrice).mul(number);
                            row.push(subsum);
                            if (feed[0].orderStatus === 'R') {
                                row.push(paidIn);
                                var paidInsum = Decimal(materialPrice).mul(paidIn);
                                row.push(paidInsum);
                                paidIn_orderSum = (Decimal(paidIn_orderSum).add(paidInsum))
                            }
                            conf.rows.push(row);
                            sum = (Decimal(sum).add(subsum));

                        }
                    }
                    conf.rows.push([null, null, null, null, null, null, null]);
                    conf.rows.push([null, '', null, '订购总金额', sum, null, null]);
                    if (feed[0].orderStatus === 'R') {
                        conf.rows.push([null, '', null, '实收总金额', paidIn_orderSum, null, null]);
                    }
                    conf.rows.push([null, null, null, null, null, null, null]);

                    conf.rows.push([null, '收货人', feed[0].receiver, null, null, null, null]);
                    conf.rows.push([null, '地址', feed[0].receiverAddress, null, null, null, null]);
                    conf.rows.push([null, '手机号码', feed[0].mobile, null, null, null, null]);

                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xls");
                    res.end(result, 'binary');
                }
            });

        }
    });

}

//查询自定义菜品
exports.getCustMetiral = function (req, res) {
    var searchQ = {isCustomer: '1'};
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('operations/login');
        } else {
            var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
            var cate = req.query.category;
            var name = req.query.name;
            var examine = req.query.examine;
            console.info('categoryID:' + cate);
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _currentIdx = parseInt(_startIdx / 10 + 1);
            if (userInfo.userType != '0') {
                searchQ.mechanism_id = userInfo.mechanism_id;
            }
            if (name) {
                searchQ.name = {$regex: name};
            }

            if (cate) {
                searchQ.categoryId = cate;
            }
            if (examine) {
                if (examine === '0') {
                    searchQ.isExamine = {$ne: '1'};
                } else {
                    searchQ.isExamine = examine;
                }
            }
            var queryArray = [];
            queryArray.push(mongodbDao.classQueryPromise({}, 'Category'));
            queryArray.push(mongodbDao.pagingQueryPromise(searchQ, 'Material', _startIdx, 10));
            queryArray.push(mongodbDao.countQueryPromise(searchQ, 'Material'));
            Q.all(queryArray).then(function (success) {
                var categorys = success[0];
                var materials = success[1];
                for (var i = 0; i < materials.length; i++) {
                    materials[i].createdAt = commonUtil.formatDate(materials[i].createdAt, 'yyyy-M-d');
                }
                name = name ? name : '';
                examine = examine ? examine : '';
                res.render('operations/customerPriceMng', {
                    categorys: categorys,
                    materials: materials,
                    userInfo: userInfo,
                    currentIdx: _currentIdx,
                    sum: success[2],
                    startIdx: (_startIdx + 1),
                    name: name,
                    parentId: 2,
                    childId: 24,
                    categoryId: cate,
                    examine: examine
                });
            });

        }
    });
}

exports.cmsAddCustMetiral = function (req, res) {
    var name = req.body.name;
    var price = req.body.minPrice;
    var categoryId = req.body.categoryId;
    var categoryName = req.body.categoryName;
    var remark = req.body.remark;
    var unit = req.body.unit;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.save({
                name: name,
                minPrice: price,
                categoryId: categoryId,
                categoryName: categoryName,
                remark: remark,
                unit: unit,
                mechanism_id: userInfo.mechanism_id,
                mechanism_name: userInfo.mechanism_name,
                mechanism_type: userInfo.userType,
                isCustomer: '1'
            }, 'Material', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
};

exports.cmsOrderItemList = function (req, res) {

    var name = req.query.supName;
    var orderStatus = '';
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var headMechanismId = userInfo.headMechanismId;
            var supplyData, searchQ = {}, searchFieldSup = 'toSupply', searchFieldRest = 'restruantId';
            //判断用户类型，1为餐厅用户，2为供应商，3为运营商用户
            if (userInfo.userType === '1') {
                var restruantArray = new Array();
                var arrayId = new Array();
                arrayId.push(mechanism_id);
                mongodbDao.queryBy({_id: new BSON.ObjectID(mechanism_id)}, 'Restruant', function (err, restruant) {
                    restruantArray.push({id: mechanism_id, name: restruant[0].name});
                    var array = new Array();
                    if (restruant[0].isHead === '1') {
                        var chainStoredIds = restruant[0].chainStoredIds;
                        chainStoredIds.forEach(function (chainStoredId) {
                            array.push(new BSON.ObjectID(chainStoredId));
                            arrayId.push(chainStoredId);
                        });
                        mongodbDao.queryBy({_id: {$in: array}}, 'Restruant', function (err, data) {
                            data.forEach(function (chainStored) {
                                restruantArray.push({id: chainStored._id.toString(), name: chainStored.name});
                            });
                            mongodbDao.distinctQuery({restruantId: {$in: arrayId}}, searchFieldSup, 'Orders', function (err, suppColl) {
                                var supplyArray = new Array();
                                var supplyIdArray = new Array();
                                suppColl.forEach(function (supplyId) {
                                    supplyIdArray.push(new BSON.ObjectID(supplyId));
                                })
                                mongodbDao.queryBy({_id: {$in: supplyIdArray}}, 'Supply', function (err, data) {
                                    data.forEach(function (supply) {
                                        supplyArray.push({id: supply._id.toString(), name: supply.name})
                                    })
                                    return res.render('operations/orderItemList', {
                                        userInfo: userInfo,
                                        supData: supplyArray,
                                        restData: restruantArray,
                                        supname: name,
                                        parentId: 3,
                                        childId: 33,
                                        orderStatus: orderStatus

                                    });
                                });
                            });
                        });
                    } else {
                        mongodbDao.distinctQuery({restruantId: {$in: arrayId}}, searchFieldSup, 'Orders', function (err, suppColl) {
                            var supplyArray = new Array();
                            var supplyIdArray = new Array();
                            suppColl.forEach(function (supplyId) {
                                supplyIdArray.push(new BSON.ObjectID(supplyId));
                            })
                            mongodbDao.queryBy({_id: {$in: supplyIdArray}}, 'Supply', function (err, data) {
                                data.forEach(function (supply) {
                                    supplyArray.push({id: supply._id.toString(), name: supply.name})
                                })
                                return res.render('operations/orderItemList', {
                                    userInfo: userInfo,
                                    supData: supplyArray,
                                    restData: restruantArray,
                                    supname: name,
                                    parentId: 3,
                                    childId: 33,
                                    orderStatus: orderStatus

                                });
                            });
                        });

                    }
                });
            } else if (userInfo.userType === '2') {
                mongodbDao.distinctQuery({toSupply: userInfo.mechanism_id}, searchFieldRest, 'Orders', function (err, suppColl) {
                    var restruantArray = new Array();
                    var restruantIdArray = new Array();
                    suppColl.forEach(function (restruantId) {
                        restruantIdArray.push(new BSON.ObjectID(restruantId));
                    })
                    mongodbDao.queryBy({_id: {$in: restruantIdArray}, isHead: '1'}, 'Restruant', function (err, data) {
                        data.forEach(function (restruant) {
                            restruantArray.push({id: restruant._id.toString(), name: restruant.name})
                        })
                        return res.render('operations/orderItemList', {
                            userInfo: userInfo,
                            supData: [userInfo.mechanism_name],
                            restData: restruantArray,
                            supname: name,
                            parentId: 3,
                            childId: 33,
                            orderStatus: orderStatus

                        });
                    });
                });
            } else {
                mongodbDao.distinctQuery(searchQ, searchFieldSup, 'Orders', function (err, suppColl) {
                    if (err) {
                        return res.json(err);
                    } else {
                        var supplyArray = new Array();
                        var supplyIdArray = new Array();
                        suppColl.forEach(function (supplyId) {
                            supplyIdArray.push(new BSON.ObjectID(supplyId));
                        })
                        mongodbDao.queryBy({_id: {$in: supplyIdArray}}, 'Supply', function (err, data) {
                            data.forEach(function (supply) {
                                supplyArray.push({id: supply._id.toString(), name: supply.name})
                            })
                            mongodbDao.distinctQuery(searchQ, searchFieldRest, 'Orders', function (err, restColl) {
                                var restruantArray = new Array();
                                var restruantIdArray = new Array();
                                restColl.forEach(function (restruantId) {
                                    restruantIdArray.push(new BSON.ObjectID(restruantId));
                                });
                                mongodbDao.queryBy({_id: {$in: restruantIdArray}}, 'Restruant', function (err, data) {
                                    data.forEach(function (restruant) {
                                        restruantArray.push({id: restruant._id.toString(), name: restruant.name});
                                    });
                                    res.render('operations/orderItemList', {
                                        userInfo: userInfo,
                                        supData: supplyArray,
                                        restData: restruantArray,
                                        supname: name,
                                        parentId: 3,
                                        childId: 33,
                                        orderStatus: orderStatus
                                    });
                                });

                            });
                        });
                    }
                });
            }
        }
    });
}


exports.querychainStored = function (req, res) {
    var headId = req.body.id;
    var restruantArray = new Array();
    mongodbDao.queryBy({_id: new BSON.ObjectID(headId)}, 'Restruant', function (err, restruant) {
        var array = new Array();
        var chainStoredIds = restruant[0].chainStoredIds;
        chainStoredIds.forEach(function (chainStoredId) {
            array.push(new BSON.ObjectID(chainStoredId));
        });
        mongodbDao.queryBy({_id: {$in: array}}, 'Restruant', function (err, data) {
            data.forEach(function (chainStored) {
                restruantArray.push({id: chainStored._id.toString(), name: chainStored.name});
            });
            console.info(JSON.stringify(restruantArray));
            return res.json({code: 100, restruantArray: restruantArray});
        });
    });
}


exports.fetchOrderItem = function (req, res) {

    var sname = req.body.supName;
    var resname = req.body.resName;
    var fenResId = req.body.fenResId;
    var supId = req.body.supId;
    var resId = req.body.resId;
    var startDate = req.body.pStartDate;
    var endDate = req.body.pEndDate;
    var orderStatus = req.body.orderStatus;
    orderStatus = orderStatus ? orderStatus : ''
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            if (userInfo.userType === '2') {
                if (fenResId) {
                    resId = fenResId;
                }
            }
            getOrderItemsFormDB(orderStatus, startDate, endDate, userInfo, sname, resname, supId, resId, function (data) {
                return res.json(data);
            });

        }
    });
}


function isExisting(OrderItemList, orderItem) {

    var result = false;
    for (var i = 0; i < OrderItemList.length; i++) {
        var obj = OrderItemList[i];
        if (obj.oid == orderItem.oid) {
            var count = Decimal(obj.count?obj.count:'0');
            var paidIn = Decimal(obj.paidIn?obj.paidIn:'0');
            count = Decimal(orderItem.count).add(count);
            paidIn = Decimal(orderItem.paidIn).add(paidIn);
            obj.count = count.toString();
            obj.paidIn = paidIn.toString();
            result = true;
            return result;
        }
    }


}

function getOrderItemsFormDB(orderStatus, pStartDate, pEndDate, userInfo, pName, sName, supId, resId, callback) {

    var startDate = pStartDate;
    var endDate = pEndDate;
    // 每页显示五条记录
    var supplyData = {};
    //var enddate="2016-06-30"
    //var startDate="2015-06-24";
    //if (pName && pName != 'undefined') {
    //    supplyData.supplyName = pName;
    //}
    //if (sName && sName != 'undefined') {//oId of resturant
    //    supplyData.restruantName = sName;
    //}

    var array = new Array();
    var restruantId;
    if (userInfo.userType == 1) {
        restruantId = userInfo.mechanism_id;
    } else if (userInfo.userType == 2) {
        restruantId = resId;
    }
    console.info('restruantId:' + restruantId);
    mongodbDao.findById(restruantId, 'Restruant', function (err, data) {
        if (data) {
            array = data.chainStoredIds;
            array.push(restruantId);
        }
        console.info(array);
        if (userInfo.userType == 1) {
            if (resId && resId != 'undefined') {
                supplyData.restruantId = resId;
            } else {
                supplyData.restruantId = {$in: array}
            }
            if (supId && supId != 'undefined') {
                supplyData.toSupply = supId;
            }
        } else if (userInfo.userType == 2) {
            if (resId && resId != 'undefined') {
                supplyData.restruantId = {$in: array};
            }
            supplyData.toSupply = userInfo.mechanism_id
        } else {
            if (resId && resId != 'undefined') {
                supplyData.restruantId = resId;
            }
            if (supId && supId != 'undefined') {
                supplyData.toSupply = supId;
            }
        }
        if (startDate || endDate) {
            supplyData.createdAt = {};
            if (startDate) {
                startDate = new Date(Date.parse(startDate.replace(/-/g, "/"))); //转换成Data();
                supplyData.createdAt.$gte = startDate;
            }
            if (endDate) {
                endDate = new Date(Date.parse(endDate.replace(/-/g, "/"))); //转换成Data();
                endDate.setDate(endDate.getDate() + 1);
                supplyData.createdAt.$lte = endDate;
            }
        }
        if (orderStatus && orderStatus != 'All') {
            supplyData.orderStatus = orderStatus;
        }
        var totalAmt = 0;
        var respObj = {};
        var paidIn_totalSum = 0;
        var orderItemList = [], orderItem = {oid: "", unit: "", price: ""};

        console.info('supplyData:' + JSON.stringify(supplyData));
        mongodbDao.queryBy(supplyData, 'Orders', function (err, data) {
            if (!!err) {
                logger.error("error: " + err);
                return reject(err);
            }
            var totalSum = 0;
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                if (obj.createdAt) {
                    obj.createdAt = commonUtil.formatDate(obj.createdAt, 'yyyy-M-d');
                }
                for (var j = 0; j < obj.orderItem.length; j++) {
                    orderItem = {};
                    var subObj = obj.orderItem[j];
                    orderItem.oid = subObj.materialId;
                    orderItem.materialName = subObj.materialName;
                    orderItem.price = subObj.materialPrice;
                    orderItem.count = subObj.number;
                    orderItem.paidIn = subObj.paidIn ? subObj.paidIn : '0';
                    var paidIn_subSum;
                    paidIn_subSum = Decimal(orderItem.price).mul(orderItem.paidIn);
                    paidIn_totalSum = Decimal(totalSum).add(paidIn_subSum);
                    var subSum = Decimal(orderItem.price).mul(orderItem.count);
                    totalSum = Decimal(totalSum).add(subSum);
                    if (!isExisting(orderItemList, orderItem)) {
                        orderItemList.push(orderItem);
                    }
                }
            }
            var arrayId = new Array();
            orderItemList.forEach(function (orderItem) {
                arrayId.push(new BSON.ObjectID(orderItem.oid));
            });

            mongodbDao.queryAdv('Material', {_id: {$in: arrayId}}, {
                _id: 1,
                remark: 1,
                unit: 1
            }, {_id: 1}, function (err, data) {
                data.forEach(function (material) {
                    orderItemList.forEach(function (orderItem) {
                        if (material._id.toString() === orderItem.oid) {
                            orderItem.unit = material.unit;
                            orderItem.remark = material.remark;
                        }
                    });
                });
                respObj.orderItemList = orderItemList;
                respObj.totalAmt = totalSum;
                respObj.paidIn_totalSum = paidIn_totalSum;
                console.log('Total Amt is :' + totalSum);
                console.log('paidIn_totalSum Amt is :' + paidIn_totalSum);
                callback(respObj);
            });
        });
    });


}

exports.getMembersForResturant = function (req, res) {
    var _startIdx = req.query.startIdx, _endIdx, _currentIdx;
    var name = req.query.name;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            var organizationId = userInfo.mechanism_id //取出总店id
            if (!_startIdx) {
                _startIdx = 0;
            } else {
                _startIdx = parseInt(_startIdx);
            }
            // 每页显示五条记录
            _endIdx = _startIdx + 10;
            _currentIdx = parseInt(_startIdx / 10 + 1);
            var searchQ = {headMechanismId: organizationId};
            if (name) {
                searchQ.mechanism_name = {$regex: name};
            }
            mongodbDao.pagingQuery(searchQ, "User", {createdAt: -1}, _startIdx, _endIdx, function (err, data) {
                if (!!err) {
                    logger.error("error:" + err);
                    //return reject(err);
                }
                for (var i = 0; i < data.length; i++) {
                    if (data[i].createdAt)
                        data[i].createdAt = commonUtil.formatDate(data[i].createdAt, 'yyyy-M-d');
                }
                name = name ? name : '';
                mongodbDao.getCount(searchQ, "User", function (err, sum) {
                    res.render('operations/membersMng', {
                        data: data,
                        userInfo: userInfo,
                        currentIdx: _currentIdx,
                        sum: sum,
                        startIdx: (_startIdx + 1),
                        parentId: 1,
                        childId: 13,
                        name: name
                    })
                });
            });

        }
    });

}

//禁用组员
exports.cmsDisMember = function (req, res) {
    var id = req.body.id;
    var avaliable = req.body.isAvab;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            //
            //redisDao.getInstance().hset(openId, "isAvab", user[0].isAvab ? user[0].isAvab : 'true');
            mongodbDao.update({_id: new BSON.ObjectID(id)}, {isAvab: avaliable}, 'User', function (err, data) {
                if (err) {
                    return res.json({status: 500});
                } else {
                    return res.json({status: 100});
                }
            });
        }
    });
}


exports.cmsresetPwd = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            res.render("operations/resetPassword", {
                parentId: 5,
                childId: 51,
                userInfo: userInfo
            });
        }
    });
}


exports.resetPwd = function (req, res) {

    var userName = req.body.userName;
    var confirmPwd = req.body.secpassWord;

    mongodbDao.update({userName: userName}, {password: confirmPwd}, 'User', function (err, data) {

        if (err) {
            return res.json({status: 200});
        } else {

            res.render('operations/login', {parentId: 0, childId: 1});
        }
    });

}

exports.appvCustMe = function (req, res) {
    var mId = req.body.meterialId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            mongodbDao.queryBy({_id: new BSON.ObjectID(mId)}, 'Material', function (err, data) {
                if (err) {
                    logger.err(err);
                    return res.json(err);
                } else {
                    var material = data[0];
                    material.isExamine = '1';
                    var newMaterial = {};
                    newMaterial.name = material.name;
                    newMaterial.price = '0';
                    newMaterial.categoryId = material.categoryId;
                    newMaterial.categoryName = material.categoryName;
                    newMaterial.remark = '';
                    newMaterial.unit = material.unit;
                    mongodbDao.save(newMaterial, 'Material', function (err, result) {
                        if (err) {
                            logger.err(err);
                            return res.json(err);
                        } else {
                            mongodbDao.update({_id: new BSON.ObjectID(mId)}, material, 'Material', function (err, result2) {
                                if (err) {
                                    logger.err(err);
                                    return res.json(err);
                                } else {
                                    return res.json({status: 100});
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

exports.toexcel = function (req, res) {

    var sname = req.body.supName;
    var resname = req.body.resName;
    var fenResId = req.body.fenResId;
    var supId = req.body.supId;
    var resId = req.body.resId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var orderStatus = req.body.orderStatus;
    orderStatus = orderStatus ? orderStatus : ''

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.json({status: 200});
        } else {
            if (userInfo.userType === '2') {
                if (fenResId) {
                    resId = fenResId;
                }
            }
            getOrderItemsFormDB(orderStatus, startDate, endDate, userInfo, sname, resname, supId, resId, function (respData) {
                var conf = {};
                var data = respData.orderItemList;
                // uncomment it for style example
                // conf.stylesXmlFile = "styles.xml";
                conf.cols = [
                    {caption: '编号', type: 'number', width: 15},
                    {caption: '名字', type: 'string', width: 20.85},
                    {caption: '单位', type: 'number', width: 20.85},
                    {caption: '备注', type: 'number', width: 20.85},
                    {caption: '价格（元）', type: 'number', width: 20.85},
                    {caption: '订购数量', type: 'number', width: 20.85},
                    {caption: '实收数量', type: 'number', width: 20.85},
                    {caption: '订购总价', type: 'number', width: 30},
                    {caption: '实收总价', type: 'number', width: 30}];
                conf.rows = [];
                var seq = 0, sum = 0;
                var toalSum = 0;
                var paidIn_toalSum = 0;
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    var row = [];
                    var paidIn = !obj.paidIn ? '0' : obj.paidIn;
                    var subSum = Decimal(!obj.price ? '0' : obj.price).mul(!obj.count ? '0' : obj.count);
                    var paidIn_subSum = Decimal(!obj.price ? '0' : obj.price).mul(paidIn);
                    toalSum = (Decimal(toalSum).add(subSum));
                    paidIn_toalSum = (Decimal(paidIn_toalSum).add(paidIn_subSum));
                    seq++;
                    row.push(seq);
                    row.push(obj.materialName);
                    row.push(obj.unit);
                    row.push(obj.remark);
                    row.push(!obj.price ? '0' : obj.price);
                    row.push(!obj.count ? '0' : obj.count);
                    row.push(!obj.paidIn ? '0' : obj.paidIn);
                    row.push(subSum);
                    row.push(paidIn_subSum);
                    conf.rows.push(row);
                }
                conf.rows.push([null, null, null, null, null, null, null, null, null]);
                conf.rows.push(['订购总金额', '', null, null, toalSum, null, null, null, null]);
                conf.rows.push(['实收总金额', '', null, null, paidIn_toalSum, null, null, null, null]);
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xls");
                res.end(result, 'binary');
            });
        }
    });
}
