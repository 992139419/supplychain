//餐厅询价单服务

var config = require('../../../config');
var mongodbDao = require('../../storage/mongodbDao');
var redisDao = require('../../storage/redisDao');
var commonUtil = require('../../helpers/commonUtil');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var logger = require('../../log/logFactory').getLogger();
var userPromise = require('../userService').userPromise;
var template = require('./templateService');
var sendMtemplate = require('../sendMtemplate');
var _ = require('underscore')._;
var offerSheetService = require('../supply/OfferSheetService');
var commonService = require('../commonService');


/**
 * 餐厅询价单查询
 * @param req
 * @param res
 */
exports.priceInquery = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var type = userInfo.userType;
            var mechanism_id = userInfo.mechanism_id;
            if (type == '1') {
                //查询餐厅信息
                var array = new Array();
                mongodbDao.findById(mechanism_id, 'Restruant', function (err, restruant) {
                    if (restruant && restruant.isHead == '1') {
                        array.push(mechanism_id);
                        if (restruant.chainStoredIds) {
                            array = _.union(array, restruant.chainStoredIds);
                        }
                    } else {
                        array.push(mechanism_id);
                    }
                    Q.nfcall(mongodbDao.queryBy, {
                        restruant_id: {$in: array},
                        start: {$ne: '2'}
                    }, 'InquerySheet').then(function (sheets) {
                        if (!sheets) {
                            return res.render('restaurant/inqueySheet/price_inquery_p08', {
                                title: '询价',
                                inquerySheets: JSON.stringify([])
                            });
                        } else {
                            //询价单时间转换
                            sheets.forEach(function (sheet) {
                                sheet.createdAt = commonUtil.formatDate(sheet.createdAt, 'yyyy-MM-dd hh:mm:ss')
                            });
                            return res.render('restaurant/inqueySheet/price_inquery_p08', {
                                title: '询价',
                                inquerySheets: JSON.stringify(sheets)
                            });
                        }
                    }).done(null, function (err) {
                        console.log(err);
                    });
                });
            }
        }
    });
}


/**
 * 新建询价单选择页面
 * @param req
 * @param res
 */
exports.addIqrySheetchoose = function (req, res) {
    res.render('restaurant/inqueySheet/addIqrySheetchoose', {title: '新建询价单'});
}


/**
 * 查询已有模板信息
 * @param req
 * @param res
 */
exports.getTemplateRead = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var mechanismId = userInfo.mechanism_id;
            var type = userInfo.userType;
            template.getTemplatePromise(mechanismId, type).then(function (templates) {
                templates.forEach(function(template){
                    template.createdAt = commonUtil.formatDate(template.createdAt,'yyyy-MM-dd hh:mm:ss')
                });
                res.render('restaurant/inqueySheet/my_template2', {templates: templates});
            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
};

/**
 * 获取所选模板的食材信息
 * @param req
 * @param res
 */
exports.templateMaterialList = function (req, res) {
    var templateId = req.query.templateId;
    mongodbDao.findById(templateId, 'Template', function (err, template) {
        //生成时间搓,取第一个食材名加时间搓生成默认报价单名
        var date = new Date();
        var newdate = commonUtil.formatDate(date, 'yyyyMMdd');
        var insheetName = !template.materials[0] == false ? template.materials[0].name +'X'+newdate : 'X' + newdate;

        if (template) {
            var materials = template.materials;
            return res.render('restaurant/inqueySheet/template_confirm02', {
                selectMaterials: JSON.stringify(materials),
                insheetName:insheetName
            });
        } else {
            return res.render('restaurant/inqueySheet/template_confirm02', {
                selectMaterials: JSON.stringify([]),
                insheetName:insheetName
            });
        }
    });


}


/**
 * 询价界面跳转
 * @param req
 * @param res
 */
exports.userDefinedCopy = function (req, res) {
    var inquerySheetDataId = req.query.inquerySheetDataId;
    mongodbDao.queryBy({_id: new BSON.ObjectID(inquerySheetDataId)}, 'InquerySheet', function (err, inquerySheetDatas) {
        if (!inquerySheetDatas) {
            return res.render('restaurant/inqueySheet/user_defined_copy', {inquerySheetData: JSON.stringify([])});
        } else if (inquerySheetDatas.length == 0) {
            return res.render('restaurant/inqueySheet/user_defined_copy', {inquerySheetData: JSON.stringify([])});
        }
        else if (inquerySheetDatas && inquerySheetDatas.length > 0) {
            if (inquerySheetDatas[0].start == '0') {
                return res.render('restaurant/inqueySheet/user_defined_copy', {inquerySheetData: JSON.stringify(inquerySheetDatas[0])});
            }
            else if (inquerySheetDatas[0].start != '0') {
                return res.render('restaurant/inqueySheet/user_defined_copy_read', {inquerySheetData: JSON.stringify(inquerySheetDatas[0])});
            }
        }

    });

}

/**
 * 新创建（不通过已有模板创建）询价单食材模板选择界面初始化方法
 * @param req
 * @param res
 */
exports.intiMaterial = function (req, res) {
    Q.all([Q.nfcall(mongodbDao.queryBy, {}, 'Category'),
        Q.nfcall(mongodbDao.queryBy, {}, 'Material')]).then(function (feel) {

        if (feel == ',') {
            console.log('并行查询结果都为空');
            return res.render('restaurant/inqueySheet/add_template02', {title: "添加模版", categorys: [], materials: []});
        }

        var categorys = feel[0];
        var materials = feel[1];
        if (categorys.length == 0) {
            console.log('没有食材类别信息');
        }
        return res.render('restaurant/inqueySheet/add_template02', {
            title: "添加模版",
            categorys: categorys,
            materials: materials,
            selectArray: JSON.stringify([])
        });
    }).done(null, function (err) {
        console.log(err);
    });
}

/**
 * 确认新建询价单
 * @param req
 * @param res
 */
exports.templateConfirmforInsheet = function (req, res) {
    var selectMaterials = JSON.parse(req.body.selectMaterial);
    var array = new Array();
    var materialArray = new Array();
    selectMaterials.forEach(function (selectMaterial) {
        array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(selectMaterial._id)}, 'Material'));
    });
    Q.all(array).then(function (materials) {
        materials.forEach(function (material) {
            if (materials && materials.length >= 0) {
                materialArray.push(material[0]);
            }
        });
        //生成时间搓,取第一个食材名加时间搓生成默认报价单名
        var date = new Date();
        var newdate = commonUtil.formatDate(date, 'yyyyMMdd');
        var insheetName = !materialArray[0] == false ? materialArray[0].name +'X'+newdate : 'X' + newdate;

        res.render('restaurant/inqueySheet/template_confirm02', {
            title: '添加询价单',
            selectMaterials: JSON.stringify(materialArray),
            insheetName:insheetName
        });
    });
}


/**
 * 新建询价单
 * @param req
 * @param res
 */
exports.addInquerySheet = function (req, res) {
    var inqueryName = req.body.inqueryName;
    var selectMaterials = JSON.parse(req.body.selectMaterials);

    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }
            var type = userInfo.userType;
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var inqryMaterialArray = new Array();
            selectMaterials.forEach(function (material) {
                inqryMaterialArray.push({
                    material_id: material._id, material_name: material.name,
                    material_unit: material.unit, material_remark: material.remark, isInquery: '1'
                });
            });
            //
            //判断是否为餐厅用户
            if (type == '1') {
                var inquerySheetData = {
                    name: inqueryName,
                    materials: inqryMaterialArray,
                    restruant_id: mechanism_id,
                    restruantName: mechanism_name,
                    isPublic: '0',
                    start: '0',
                    createUserId: userInfo.id
                };
                Q.nfcall(mongodbDao.save, inquerySheetData, 'InquerySheet').then(function (data) {
                    if (data) {
                        res.redirect('/user_defined_copy?inquerySheetDataId=' + data[0]._id);
                    }
                });


            }
        }
    });
}


/**
 * 根据询价单Id查询 询价单信息
 * @param req
 * @param res
 */
exports.qryInSheet = function (req, res) {
    var inSheetId = req.query.inSheetId;
    mongodbDao.findById(inSheetId, 'InquerySheet', function (err, sheet) {
        if (sheet) {
            res.redirect('/user_defined_copy?inquerySheetDataId=' + sheet._id);
        }
    });

}


/**
 *查询供应商提供给餐厅的报价单列表
 * @param req
 * @param res
 */
exports.qryOfferSheet = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_type = userInfo.userType;
            var array = new Array();
            //查询餐厅信息，判断是否为总店，是总店则获取所有分店的报价单信息。
            mongodbDao.findById(mechanism_id, 'Restruant', function (err, restruant) {
                if (restruant && restruant.isHead == '1') {
                    array.push(mechanism_id);
                    if (restruant.chainStoredIds) {
                        array = _.union(array, restruant.chainStoredIds);
                    }
                } else {
                    array.push(mechanism_id);
                }
                Q.all([Q.nfcall(mongodbDao.queryBy, {
                    mechanism_id: userInfo.headMechanismId,
                    mechanism_type: mechanism_type
                }, 'FrequentContacts'),
                    Q.nfcall(mongodbDao.queryBy, {
                        restruantdId: {$in: array},
                        start: {$in:['1','2']}
                    }, 'OfferSheet')]).then(function (datas) {
                    var publicOfferSheets = new Array();
                    var constactOfferSheets = new Array();
                    if (datas == ',') {
                        console.log('查询结果都为空');
                        res.render('restaurant/inqueySheet/price_inquery_p06', {
                            constactOfferSheets: JSON.stringify([]),
                            publicOfferSheets: JSON.stringify([])
                        });
                    } else {
                        var fconstacts = datas[0];
                        var offerSheets = datas[1];
                        if (!offerSheets) {
                            return res.render('restaurant/inqueySheet/price_inquery_p06', {
                                constactOfferSheets: JSON.stringify([]),
                                publicOfferSheets: JSON.stringify([])
                            });
                        }
                        var supplyId;
                        offerSheets.forEach(function (offerSheet) {
                            //时间转换
                            offerSheet.createdAt = commonUtil.formatDate(offerSheet.createdAt, 'yyyy-MM-dd hh:mm:ss');
                            supplyId = offerSheet.supply_id;
                            if (fconstacts.length >= 1) {
                                if (_.indexOf(fconstacts[0].contacts, supplyId) != -1) {
                                    constactOfferSheets.push(offerSheet);
                                } else {
                                    publicOfferSheets.push(offerSheet);
                                }
                            } else {
                                constactOfferSheets = [];
                                publicOfferSheets = offerSheets;
                            }
                        });
                        console.info(JSON.stringify(constactOfferSheets));
                        return res.render('restaurant/inqueySheet/price_inquery_p06', {
                            constactOfferSheets: JSON.stringify(constactOfferSheets),
                            publicOfferSheets: JSON.stringify(publicOfferSheets)
                        });
                    }
                });

            });
        }
    });
}

exports.addOfferSheetItem = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var orderItem = req.body.orderItem;
            var offerSheetId = req.body.offerSheetId;
            var supplyName = req.body.supplyName;
            res.render('restaurant/inqueySheet/addOfferSheetItem',
                {openId: userInfo.openId,
                    orderItem:orderItem,
                    offerSheetId:offerSheetId,
                    supplyName:supplyName});
        }
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
            var orderItem = req.body.orderItem;
            console.info("orderItem:"+orderItem);
            Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(offerSheetId)}, 'OfferSheet').then(function (offerSheets) {
                if (offerSheets) {
                    var offerSheet = offerSheets[0];
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
                        //            offerMaterial.number = '0.00';
                        //            if (offerMaterial.material_id === material.materialId) {
                        //               console.info(material.materialId+':'+material.number);
                        //                offerMaterial.number = material.number
                        //            }
                        //    });
                        //});
                        //console.info(JSON.stringify(offerSheet.materials));
                        res.render('restaurant/inqueySheet/list_confirm_p07', {
                            title: '下单',
                            offerSheet: JSON.stringify(offerSheet),
                            orderItem:orderItem,
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


/**
 * 选择询价的常用联系人（供应商
 * @param req
 * @param res
 */
exports.chooseContacts = function (req, res) {
    var inquerySheetData = req.query.inquerySheetData;

    //查询常用联系人
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {

            var type = userInfo.userType;
            var mechanism_id = userInfo.headMechanismId;
            Q.nfcall(mongodbDao.queryBy, {
                mechanism_id: mechanism_id,
                mechanism_type: type
            }, 'FrequentContacts').then(function (fcontacts) {
                if (!fcontacts) {
                    res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'})
                } else if (fcontacts.length == 0) {
                    res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'})
                } else if (!fcontacts[0].contacts || fcontacts[0].contacts == 0) {
                    res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'})
                } else {
                    var array = new Array();
                    var supplys = new Array();
                    fcontacts[0].contacts.forEach(function (contact) {
                        array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(contact)}, 'Supply'));
                    });
                    Q.all(array).then(function (supplysArray) {
                        supplysArray.forEach(function (supplyArray) {
                            if (supplyArray.length >= 1) {
                                supplys.push(supplyArray[0]);
                            }
                        });
                        if (supplys.length == 0) {
                            return res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'});
                        }
                        res.render('restaurant/inqueySheet/new_order_list_p12_copy', {
                            inquerySheetData: inquerySheetData,
                            supplys: JSON.stringify(supplys)
                        });
                    });
                }
            });
        }
    });
}

/**
 * 确认询价Proomise(对已有的询价单进行询价提交操作)
 * @param req
 * @param res
 * @param inquerySheetData
 * @returns {*}
 */
function commitInqeurySheetPromise(req, res, inquerySheetData) {

    return Q.Promise(function (resolve, reject) {
        userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('restaurant/login');
            } else {

                var isConfirme = userInfo.isConfirme;
                var mechanism_id = userInfo.mechanism_id;
                var mechanism_name = userInfo.mechanism_name;
                var headMechanismId = userInfo.headMechanismId;
                //判断用户是否有提交权限
                if (isConfirme == '0') {
                    return reject({code: 101, err: '请联系餐厅管理员进行询价'});
                } else {
                    //公开询价单
                    if (inquerySheetData.supplyIds.length == 0) {
                        console.info('公开')
                        //更新询价单数据
                        mongodbDao.update({_id: new BSON.ObjectID(inquerySheetData._id)}, {
                            materials: inquerySheetData.materials,
                            isPublic: '1',
                            start: '1',
                            comfirmeUserId: userInfo.id,
                            supplyId: '',
                            supplyName: ''
                        }, 'InquerySheet', function (err, result) {
                            if (result == 1) {
                                return resolve({code: 100});
                            }
                        });
                        //对公开询价的食材进行纪录和修改该食材询价的餐厅数等信息。
                        createCInquerySheet(inquerySheetData.materials, mechanism_id, mechanism_name, headMechanismId);
                    }
                    //判断询价时所选供应商是否为多选
                    else if (inquerySheetData.supplyIds.length == 1) {
                        //更新询价单数据
                        mongodbDao.update({_id: new BSON.ObjectID(inquerySheetData._id)}, {
                            materials: inquerySheetData.materials,
                            isPublic: '0',
                            start: '1',
                            comfirmeUserId: userInfo.id,
                            supplyId: inquerySheetData.supplyIds[0].id,
                            supplyName: inquerySheetData.supplyIds[0].name
                        }, 'InquerySheet', function (err, result) {
                            if (result == 1) {
                                return resolve({code: 100});
                            }
                        });
                    }
                    //判断是否选择多个供应商
                    else if (inquerySheetData.supplyIds.length > 1) {

                        var arry = new Array();
                        inquerySheetData.supplyIds.forEach(function (supplyId) {
                            var newInquerySheetData = {
                                name: inquerySheetData.name,
                                materials: inquerySheetData.materials,
                                restruant_id: inquerySheetData.restruant_id,
                                restruantName: inquerySheetData.restruantName,
                                isPublic: inquerySheetData.isPublic,
                                start: '1',
                                createUserId: inquerySheetData.createUserId,
                                comfirmeUserId: userInfo.id,
                                supplyId: supplyId.id,
                                supplyName: supplyId.name
                            }
                            arry.push(Q.nfcall(mongodbDao.save, newInquerySheetData, 'InquerySheet'));
                        });
                        Q.all(arry).then(function (datas) {
                            if (datas == ',' || datas.length == 0) {
                                return reject({code: 102});
                            }
                            mongodbDao.removeById(inquerySheetData._id, 'InquerySheet', function (err, data) {
                                if (data == 1) {
                                    return resolve({code: 100, inquerySheetDatas: datas});
                                }

                            });

                        });
                    }

                }
            }
        });
    });
}

/**
 * 确认询价
 * @param req
 * @param res
 */
exports.updateInquerySheet = function (req, res) {
    var inquerySheetData = JSON.parse(req.body.inquerySheetData);
    commitInqeurySheetPromise(req, res, inquerySheetData).then(function (resulte) {
        //发送模版
        if (inquerySheetData.supplyIds.length == 0) {
            return res.json({code: 100});
        }
        else if (inquerySheetData.supplyIds.length == 1) {
            sendInqueryMtemplate(inquerySheetData._id, inquerySheetData.supplyIds[0].id, inquerySheetData.restruantName, inquerySheetData.restruant_id);
        } else if (inquerySheetData.supplyIds.length > 1) {
            var inquerySheetDatas = resulte.inquerySheetDatas;
            //发送报价模版
            inquerySheetDatas.forEach(function (inquerySheets) {

                sendInqueryMtemplate(inquerySheets[0]._id + '', inquerySheets[0].supplyId, inquerySheets[0].restruantName, inquerySheetData.restruant_id);
            });
        }
        return res.json({code: 100})
    }).done(null, function (err) {
        console.log(err);
        return res.json({code: 101});
    });
}

/**
 *发送询价单模板方法
 * @param inquerySheet
 * @param supplyIds
 */
function sendInqueryMtemplate(inquerySheetId, supplyId, restruantName, restruant_id) {

    mongodbDao.findById(restruant_id, 'Restruant', function (err, restruant) {
        if (!restruant) {
            return console.log('没有找到' + restruant_id + '的餐厅，模板发送失败');
        }
        Q.nfcall(mongodbDao.queryBy, {
            mechanism_id: supplyId,
            userType: '2',
            userAuth: '1'
        }, 'User').then(function (users) {
            users.forEach(function (user) {
                var openId = user.openId;
                sendMtemplate.sendMtemplate002(inquerySheetId, openId, restruantName, restruant.telephone);
            });
        });
    });


}


/**
 *新建订单
 * @param req
 * @param res
 */
exports.addOrder = function (req, res) {
    var orderItem = JSON.parse(req.body.orderItem);
    var offerSheetId = req.body.offerSheetId;
    var offerSheetName = req.body.offerSheetName;
    var toSupplyId = req.body.toSupply;
    var sum = req.body.sum;
    var supplyName = req.body.supplyName;
    var restruantName = req.body.name;
    var header = req.body.header;
    var telephone = req.body.telephone;
    var area = req.body.area;
    var address = req.body.address;
    var restruantId = req.body.restruantId;
    var order;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {

            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }

            //判断当前餐厅人员是否有权限下单
            var isConfirme = userInfo.isConfirme;

            //生成订单编号
            var orderNo = commonService.getOrderNo();
            if (isConfirme == '1') {

                // 查询餐厅信息，获取餐厅地址，和电话
                Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(userInfo.mechanism_id)}, 'Restruant').then(function (datas) {

                    //判断是否存在餐厅信息,此处做了一个特别处理，这里的订单单据所属餐厅以发货时，所选餐厅为最终所属
                    if (datas.length > 0) {
                        var restruant = datas[0];
                        order = {
                            orderNo: orderNo,
                            orderName: offerSheetName,
                            orderItem: orderItem,
                            offerSheetId: offerSheetId,
                            toSupply: toSupplyId,
                            sum: sum,
                            supplyName: supplyName,
                            restruantId: restruantId,
                            restruantName: restruantName,
                            mobile: telephone,
                            receiverId: '',
                            receiver: header,
                            receiverAddress: address,
                            createById: userInfo.id,
                            createBy: userInfo.userName,
                            comfirmeUserId: userInfo.id,
                            comfirmeUserName: userInfo.userName,
                            orderStatus: 'N'
                        }
                        Q.nfcall(mongodbDao.save, order, 'Orders').then(function (data) {
                            if (data) {
                                //更改报价单状态
                                mongodbDao.update({_id: new BSON.ObjectID(offerSheetId)}, {start: '2'}, 'OfferSheet', function (err, index) {
                                    //发送模板通知
                                    commonService.sendOrderTemplate(data[0]._id);
                                    //跳转到订单页面
                                    return res.json({code: 100, errmsg: '下单成功!'});
                                    //return res.redirect('/myorder?openId=' + userInfo.openId);
                                });
                            }
                        }).done(null, function (err) {
                            console.log(err);
                        });
                    } else {
                        return res.json({code: 500, errmsg: '当前所属餐厅不存在'});
                    }
                });
            } else {
                Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(userInfo.mechanism_id)}, 'Restruant').then(function (datas) {
                    //判断是否存在餐厅信息
                    if (datas.length > 0) {
                        var restruant = datas[0];
                        order = {
                            orderNo: orderNo,
                            orderItem: orderItem,
                            offerSheetId: offerSheetId,
                            toSupply: toSupplyId,
                            sum: sum,
                            supplyName: supplyName,
                            restruantId: restruantId,
                            restruantName: restruantName,
                            mobile: telephone,
                            receiverAddress: address,
                            createById: userInfo.id,
                            createBy: userInfo.userName,
                            orderStatus: 'P'
                        }
                        Q.nfcall(mongodbDao.save, order, 'Orders').then(function (data) {
                            if (data) {
                                //更改报价单状态
                                mongodbDao.update({_id: new BSON.ObjectID(offerSheetId)}, {start: '2'}, 'OfferSheet', function (err, index) {
                                    //跳转到订单页面
                                    return res.json({code: 200, errmsg: '当前没有权限下单，请联系餐厅管理员进行下单操作！'});
                                    //return res.redirect('/myorder?openId=' + userInfo.openId);
                                });
                            }
                        });
                    } else {
                        return res.json({code: 500, errmsg: '当前所属餐厅不存在'});
                    }
                });
            }
            //将订单的食材信息，备份到食材历史表中
            orderItem.forEach(function (materail) {
                var materialHistData = {
                    materialId: materail.materialId,
                    materialName: materail.materialName,
                    price: materail.materialPrice,
                    unit: materail.unit,
                    remark: materail.remark,
                    number: materail.number,
                    mechanismId: userInfo.mechanism_id,
                    mechanismName: userInfo.mechanism_name,
                    mechanismType: userInfo.userType
                }
                offerSheetService.updateorsaveMaterialHis(materialHistData).then(function (data) {

                }).done(null, function (err) {
                    console.log(err);
                });
            });
        }
    });
}


//将公开询价的食材放到公开食材表中
function createCInquerySheet(materials, restruantId, restruantName, headMechanismId) {
    var sqlArray = new Array();
    materials.forEach(function (material) {
        var cInquerySheet = {
            material_id: material.material_id,
            material_name: material.material_name,
            material_unit: material.material_unit,
            material_remark: material.material_remark,
            restruantId: restruantId,
            headMechanismId: headMechanismId,
            restruantName: restruantName
        }
        sqlArray.push(Q.nfcall(mongodbDao.updateOrSave, {material_id: material.material_id,restruantId:restruantId}, cInquerySheet, 'CInquerySheet'));
        //对询价的食材进行增加询价数量
        sqlArray.push(Q.nfcall(mongodbDao.updateNotset, {
            _id: new BSON.ObjectID(material.material_id),
            restaurantIds: {$nin: [restruantId]}
        }, {$inc: {restaurantNum: 1}, $addToSet: {restaurantIds: restruantId}}, 'Material'));

    });
    Q.all(sqlArray).then(function (result) {
        if (!result) {
            console.log('公共询价食材，放入公共食材表中失败');
        } else {
            console.log('公共询价食材，放入公共食材表中成功');
        }
    }).catch(function (err) {
        console.log(err);
    }).done(null, function (err) {
        console.info(err);
    })
}



