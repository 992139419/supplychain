//供应商报价单服务

var config = require('../../../config');
var mongodbDao = require('../../storage/mongodbDao');
var redisDao = require('../../storage/redisDao');
var commonUtil = require('../../helpers/commonUtil');
var underscore = require('underscore');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var userPromise = require('../userService').userPromise;
var template = require('../restaurant/templateService');
var sendMtemplate = require('../sendMtemplate');
var commonService = require('../commonService');

/**
 *查询报价单
 * @param req
 * @param res
 */
exports.qryOfferSheet = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            Q.nfcall(mongodbDao.queryBy, {supply_id: mechanism_id}, 'OfferSheet').then(function (sheets) {

                if (!sheets || sheets.length == 0) {
                    return res.render('supply/offersheet/price_offer', {
                        title: '报价',
                        offerSheets: JSON.stringify([])
                    });
                } else {
                    sheets.forEach(function (sheet) {
                        sheet.createdAt = commonUtil.formatDate(sheet.createdAt, 'yyyy-MM-dd hh:mm:ss');
                    });
                    return res.render('supply/offersheet/price_offer', {
                        title: '报价',
                        offerSheets: JSON.stringify(sheets)
                    });
                }
            }).done(null, function (err) {
                console.info(err);
            });
        }
    }).done(null, function (err) {
        console.info(err);
    });
}

/**
 * 新增报价单选择页面
 * @param req
 * @param res
 */
exports.addOfferSheetchoose = function (req, res) {
    res.render('supply/offersheet/addOfferSheetchoose', {title: '新增报价单'});
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
            var userInfoId = userInfo.id;
            var mechanismId = userInfo.mechanism_id;
            var type = '2' //默认供应商类型
            template.getTemplatePromise(mechanismId, type).then(function (templates) {
                templates[0].forEach(function(template){
                    template.tiem = commonUtil.formatDate(template.createdAt,'yyyy-MM-dd hh:mm:ss');
                });
                res.render('supply/offersheet/templateListForOffer', {templates: templates[0]});
            }).done(null, function (err) {
                console.info(err);
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
        if (template) {
            var materials = template.materials;

            if (materials.length == 0) {
                res.render('supply/offersheet/newOfferprice', {
                    title: '添加报价单',
                    offerMaterialArray: JSON.stringify([])
                });
            } else if (materials.length >= 1) {
                var offerMaterialArray = new Array();
                materials.forEach(function (material) {
                    var offerMaterial = {
                        name: material.name,
                        _id: material._id,
                        unit: material.unit,
                        remark: material.remark,
                        price: '0.00'
                    }
                    offerMaterialArray.push(offerMaterial);
                });
                //生成时间搓,取第一个食材名加时间搓生成默认报价单名
                var date = new Date();
                var newdate = commonUtil.formatDate(date, 'yyyyMMddhhmmss');
                var offerName = !offerMaterialArray[0] == false ? offerMaterialArray[0].name +'B'+newdate : 'B' + newdate;

                res.render('supply/offersheet/newOfferprice', {
                    title: '添加报价单',
                    offerMaterialArray: JSON.stringify(offerMaterialArray),
                    offerName:offerName
                });
            }
        }
    });
}

/**
 * 新增配送订单选择页面
 * @param req
 * @param res
 */
exports.addDistributionChoose = function (req, res) {
    res.render('supply/offersheet/addDistributionChoose', {title: '新增配送订单'});
}


/**
 * 配送模板选择查询已有模板信息
 * @param req
 * @param res
 */
exports.getTemplateReadForDist = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var userInfoId = userInfo.id;


            var mechanismId = userInfo.mechanism_id;
            var type = '2' //默认供应商类型
            var number = req.query.number

            template.getTemplatePromise(mechanismId, type, number).then(function (templates) {
                templates[0].forEach(function(template){
                    template.createdAt = commonUtil.formatDate(template.createdAt,'yyyy-MM-dd hh:mm:ss');
                });
                if (templates[1] == 1) {

                    res.render('supply/offersheet/templateListForDist', {templates: templates[0]});
                } else {
                    res.json({templates: templates[0]});
                }

            }).done(null, function (err) {
                console.info(err);
            });
        }
    });
};

/**
 * 获取所选模板的食材信息
 * @param req
 * @param res
 */
exports.templateMaterialListForDist = function (req, res) {
    var templateId = req.query.templateId;
    userPromise(req,res).then(function(userInfo){
        var mechanismId = userInfo.mechanism_id;
        var mechanismType = userInfo.userType;
        mongodbDao.findById(templateId, 'Template', function (err, template) {
            if (template) {
                var materials = template.materials;
                if (materials.length == 0) {
                    res.render('supply/offersheet/newDistOrder', {
                        title: '添加报价单',
                        offerMaterialArray: JSON.stringify([])
                    });
                } else if (materials.length >= 1) {
                    var materialIds = new Array();
                    var orderMaterialArray = new Array();
                    materials.forEach(function (material) {
                        var orderMaterial = {
                            materialName: material.name,
                            materialId: material._id.toString(),
                            materialPrice: '0.00',
                            unit: material.unit,
                            remark: material.remark,
                            number: '0'
                        }
                        materialIds.push(material._id.toString());
                        orderMaterialArray.push(orderMaterial);
                    });
                    queryMaterialHis(mechanismId, mechanismType, materialIds).then(function(materialArray){
                        orderMaterialArray.forEach(function(orderMaterial){
                            materialArray.forEach(function(material){
                                if(orderMaterial.materialId == material.materialId){
                                    orderMaterial.materialPrice = material.price;
                                    orderMaterial.number = material.number;
                                }
                            })
                        })
                        res.render('supply/offersheet/newDistOrder', {
                            title: '添加报价单',
                            orderMaterialArray: JSON.stringify(orderMaterialArray)
                        });
                    })

                }
            }
        });
    });
}


/**
 * 根据所选中的联系人保存配送订单
 * @param req
 * @param res
 */
exports.saveOrderDist = function (req, res) {
    var orderItem = JSON.parse(req.body.orderItem);
    var sum = req.body.sum;
    var name = req.body.name;
    var header = req.body.header;
    var telephone = req.body.telephone;
    var area = req.body.area;
    var address = req.body.address;
    var restruantdId = req.body.id;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }
            //生成订单编号
            var orderNo = commonService.getOrderNo();
            var isConfirme = userInfo.isConfirme;
            //先对配送单进行保存
            var orderArray = new Array();
            var order = {
                orderNo: orderNo,
                orderName: name + '餐厅的直接配送订单',
                orderItem: orderItem,
                offerSheetId: '',
                toSupply: userInfo.mechanism_id,
                sum: sum,
                supplyName: userInfo.mechanism_name,
                restruantId: restruantdId,
                restruantName: name,
                mobile: telephone,
                receiverId: '',
                receiver: header,
                receiverAddress: address,
                createById: userInfo.id,
                createBy: userInfo.userName,
                comfirmeUserId: '',
                comfirmeUserName: '',
                orderStatus: 'N',
                shipperId: '',
                shipper: '',
                remark: '供应商直接配送'
            }
            orderArray.push(Q.nfcall(mongodbDao.save, order, 'Orders'));
            Q.all(orderArray).then(function (orders) {
                if (isConfirme == '0') {
                    return res.json({code: 101});
                } else {
                    var updateArray = new Array();
                    orders.forEach(function (order) {
                        order[0].shipperId = userInfo.id;
                        order[0].shipper = userInfo.userName;
                        order[0].orderStatus = 'S';
                        updateArray.push(Q.nfcall(mongodbDao.update, {_id: new BSON.ObjectID(order[0]._id + '')}, order[0], 'Orders'));
                    });
                    Q.all(updateArray).then(function (datas) {

                        //发送已配送模板
                        commonService.sendOrderTemplate005(orders[0][0]._id);
                        return res.json({code: 100});
                    });
                }
            });
            //将主动配送的食材信息，备份到食材历史表
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
                updateorsaveMaterialHis(materialHistData).then(function (data) {

                }).done(null, function (err) {
                    console.log(err);
                });
            });
        }
    });
}

//查询所选食材信息
exports.queryMaterials = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (userInfo) {
            var selectMaterials = JSON.parse(req.body.selectMaterials);
            var array = new Array();
            selectMaterials.forEach(function (selectMaterial) {
                array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(selectMaterial._id)}, 'Material'));
            });
            var offerMaterialArray = new Array();
            var materialIds = new Array();
            Q.all(array).then(function (materialsArray) {
                materialsArray.forEach(function (materials) {
                    if (materials && materials.length > 0) {
                        var offerMaterial = {
                            name: materials[0].name,
                            _id: materials[0]._id.toString(),
                            unit: materials[0].unit,
                            remark: materials[0].remark,
                            price: '0.00'
                        }
                        materialIds.push(materials[0]._id.toString());
                        offerMaterialArray.push(offerMaterial);
                    }
                });
                //查询食材配送历史纪录
                queryMaterialHis(userInfo.mechanism_id, userInfo.userType, materialIds).then(function (materials) {
                    materials.forEach(function (material) {
                        offerMaterialArray.forEach(function (offerMaterial) {
                            if (offerMaterial._id === material.materialId) {
                                offerMaterial.price = material.price;
                                offerMaterial.unit = material.unit;
                                offerMaterial.remark = material.remark;
                            }
                        });
                    });
                    //生成时间搓,取第一个食材名加时间搓生成默认报价单名
                    var date = new Date();
                    var newdate = commonUtil.formatDate(date, 'yyyyMMdd');
                    var offerName = !offerMaterialArray[0] == false ? offerMaterialArray[0].name +'B'+newdate : 'B' + newdate;

                    return res.render('supply/offersheet/newOfferprice', {
                        title: '添加报价单',
                        offerMaterialArray: JSON.stringify(offerMaterialArray),
                    offerName:offerName
                    });
                });
            });
        }

    });

}

//查询所选食材信息
exports.queryMaterialsDist = function (req, res) {
    var selectMaterials = JSON.parse(req.body.selectMaterials);
    var array = new Array();
    userPromise(req, res).then(function (userInfo) {
        selectMaterials.forEach(function (selectMaterial) {
            array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(selectMaterial._id)}, 'Material'));
        });
        var orderMaterialArray = new Array();
        var materialIds = new Array();
        Q.all(array).then(function (materialsArray) {
            materialsArray.forEach(function (materials) {
                if (materials && materials.length > 0) {
                    var orderMaterial = {
                        materialName: materials[0].name,
                        materialId: materials[0]._id.toString(),
                        materialPrice: '0.00',
                        unit: materials[0].unit,
                        remark: materials[0].remark,
                        number: '0'
                    }
                    materialIds.push(materials[0]._id.toString());
                    orderMaterialArray.push(orderMaterial);
                }
            });

            //查询食材配送历史纪录
            queryMaterialHis(userInfo.mechanism_id, userInfo.userType, materialIds).then(function (materials) {
                materials.forEach(function (material) {
                    orderMaterialArray.forEach(function (orderMaterial) {
                        if (orderMaterial.materialId === material.materialId) {
                            orderMaterial.materialPrice = material.price;
                            orderMaterial.unit = material.unit;
                            orderMaterial.number = material.number;
                            orderMaterial.remark = material.remark;

                        }
                    });
                });
                return res.render('supply/offersheet/newDistOrder', {
                    title: '添加报价单',
                    orderMaterialArray: JSON.stringify(orderMaterialArray)
                });
            });

        });

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
            console.info('并行查询结果都为空');
            return res.render('supply/offersheet/chooseMaterial', {
                title: "添加模版",
                categorys: [],
                materials: [],
                selectArray: JSON.stringify([])
            });
        }

        var categorys = feel[0];
        var materials = feel[1];
        if (categorys.length == 0) {
            console.info('没有食材类别信息');
        }

        return res.render('supply/offersheet/chooseMaterial', {
            title: "添加报价单",
            categorys: categorys,
            materials: materials,
            selectArray: JSON.stringify([])
        });
    }).done(null, function (err) {
        console.log(err);
    });
}


/**
 * 新创建（不通过已有模板创建）询价单食材模板选择界面初始化方法
 * @param req
 * @param res
 */
exports.intiMaterialDist = function (req, res) {
    Q.all([Q.nfcall(mongodbDao.queryBy, {}, 'Category'),
        Q.nfcall(mongodbDao.queryBy, {}, 'Material')]).then(function (feel) {

        if (feel == ',') {
            console.info('并行查询结果都为空');
            return res.render('supply/offersheet/chooseMaterialDist', {
                title: "添加模版",
                categorys: [],
                materials: [],
                selectArray: JSON.stringify([])
            });
        }

        var categorys = feel[0];
        var materials = feel[1];
        if (categorys.length == 0) {
            console.info('没有食材类别信息');
        }

        return res.render('supply/offersheet/chooseMaterialDist', {
            title: "添加报价单",
            categorys: categorys,
            materials: materials,
            selectArray: JSON.stringify([])
        });
    }).done(null, function (err) {
        console.log(err);
    });
}


//修改公开报价单
exports.updatePublicOffer = function (req, res) {
    var offerSheetData = JSON.parse(req.body.offerSheetData);
    var offerSheetId = offerSheetData._id;
    userPromise(req, res).then(function (userInfo) {
        offerSheetData.comfirmeUserId = userInfo.id;
        offerSheetData.start = '1';
        delete offerSheetData._id;
        delete offerSheetData.createdAt;
        var mechanism_id = userInfo.mechanism_id;
        var mechanism_name = userInfo.mechanism_name;
        mongodbDao.update({_id: new BSON.ObjectID(offerSheetId)}, offerSheetData, 'OfferSheet', function (err, data) {
            if (data === 1) {
                //获取供应商链接方式
                mongodbDao.findById(userInfo.mechanism_id, 'Supply', function (err, suplly) {
                    var contactNo;
                    if (!err && suplly) {
                        contactNo = suplly.telephone;
                        var array = new Array();
                        offerSheetData.materials.forEach(function (material) {
                            if(material.isOffer==='1'){
                                array.push(material);
                            }
                        });
                        //将选择公开报价的食材放到公开食材表中
                        createSupplyPrice(array, mechanism_id, mechanism_name, contactNo);
                        //成功跳转到首页
                        return res.redirect('/qryOfferSheet?openId=' + userInfo.openId);
                    } else {
                        return res.json({errmsg: '所属供应商不存在'});
                    }
                });
            }
        });
        //对公开报价的食材备份到食材历史表
        offerSheetData.materials.forEach(function (material) {
            if(material.isOffer==='1'){
            var materialHistData = {
                materialId: material.material_id,
                materialName: material.material_name,
                price: material.price,
                unit: material.unit,
                remark: material.remark,
                number: '0',
                mechanismId: userInfo.mechanism_id,
                mechanismName: userInfo.mechanism_name,
                mechanismType: userInfo.userType
            }
            updateorsaveMaterialHis(materialHistData).then(function (data) {

            }).done(null, function (err) {
                console.log(err);
            });
            }
        });

    }).done(null, function (err) {
        console.log(err);
    });
}

exports.offerSheetNewMaterial=function(req,res){
    var offerSheetId = req.body.offerSheetId;
    //var supplyName = req.body.supplyName;
    var itemName = req.body.itemName;
    var itemPrice = req.body.itemPrice;
    var itemNumber = req.body.itemNumber;
    var itemUnit = req.body.itemUnit;
    var itemMemo = req.body.itemMemo;
    //openId: _openId,
    //var offerSheetData;
    //return res.json({offerSheetId: offerSheetId,itemName:itemName,itemPrice:itemPrice,itemNumber:itemNumber,itemUnit:itemUnit,itemMemo:itemMemo});
    mongodbDao.findById(offerSheetId, 'OfferSheet', function (err, offerSheetData) {
        if (!err && offerSheetData) {
            var newmaterialno=commonService.getNewMaterialNo();
            offerSheetData.materials.push({
                material_id: newmaterialno,
                material_name: itemName,
                price: itemPrice,
                unit: itemUnit,
                remark: itemMemo,
                isOffer: '1',
                //number: itemNumber,
                newitem: '1'
            });
            //return res.json(offerSheetData);
            mongodbDao.update({_id: new BSON.ObjectID(offerSheetId)},
                offerSheetData, 'OfferSheet', function (err, result) {
                if (result == 1) {
                    return res.json({code: 100,mid:newmaterialno});
                }
            });
        } else {
            return res.json({code: 102});
        }
    });
}

/**
 * 新建报价单
 * @param req
 * @param res
 */
exports.addOfferSheet = function (req, res) {
    var offerName = req.body.offerName;
    var selectMaterials = JSON.parse(req.body.selectMaterials);
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var type = userInfo.userType;
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var isGuest = userInfo.isGuest;
            var materialArray = new Array();
            var price;
            //判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }

            selectMaterials.forEach(function (material) {
                if (material.price) {
                    price = material.price;
                } else {
                    price = '0.00';
                }
                materialArray.push({
                    material_id: material._id,
                    material_name: material.name,
                    price: price,
                    unit: material.unit,
                    remark: material.remark,
                    isOffer: '1'
                });
            });
            //判断是否为供应商用户
            if (type == '2') {
                var offerSheetData = {
                    name: offerName,
                    materials: materialArray,
                    supply_id: mechanism_id,
                    supplyName: mechanism_name,
                    isPublic: '0',
                    restruantdId: '',
                    restruantdName: '',
                    start: '0',
                    createUserId: userInfo.id,
                    comfirmeUserId: ''
                };
                Q.nfcall(mongodbDao.save, offerSheetData, 'OfferSheet').then(function (data) {
                    if (data) {
                        res.render('supply/offersheet/offerpriceComfirm', {
                            title: '报价单确认报价',
                            offerSheetData: JSON.stringify(offerSheetData)
                        });
                    }
                });
            } else {
                return res.render('restaurant/login', {openId: userInfo.openId});
            }
        }
    });
}


/**
 * 选择报价的常用联系人（餐厅）
 * @param req
 * @param res
 */
exports.chooseContacts = function (req, res) {

    var offerSheetData = JSON.parse(req.body.offerSheetData);
    //查询常用联系人
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var type = userInfo.userType;
            Q.nfcall(mongodbDao.queryBy, {
                mechanism_id: userInfo.mechanism_id,
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
                    var restruantds = new Array();
                    fcontacts[0].contacts.forEach(function (contact) {
                        array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(contact)}, 'Restruant'));
                    });
                    Q.all(array).then(function (restruantdsArray) {
                        restruantdsArray.forEach(function (restruantdArray) {
                            if (restruantdArray.length >= 1) {
                                restruantds.push(restruantdArray[0]);
                            }
                        });
                        if (fcontacts.length == 0) {
                            return res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'})
                        }

                        return res.render('supply/offersheet/new_order_list_p12_copy', {
                            offerSheetData: JSON.stringify(offerSheetData),
                            restruantds: JSON.stringify(restruantds)
                        });
                    });
                }
            });
        }
    });
}

/**
 * 确认询价Proomise(进行报价提交操作)
 * @param req
 * @param res
 * @param offerSheetData
 * @returns {*}
 */
function commitOfferSheetPromise(req, res, offerSheetData) {
    return Q.Promise(function (resolve, reject) {
        userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('restaurant/login');
            } else {

                var isConfirme = userInfo.isConfirme;
                //判断用户是否有提交权限
                if (isConfirme == '0') {
                    return reject({code: 101, err: '请联系管理员进行报价'});
                } else {
                    //判断询价时所选供应商是否为多选
                    if (offerSheetData.restruantds.length == 1) {
                        //更新询价单数据
                        mongodbDao.update({_id: new BSON.ObjectID(offerSheetData._id)}, {
                            materials: offerSheetData.materials,
                            isPublic: '0',
                            start: '1',
                            comfirmeUserId: userInfo.id,
                            restruantdId: offerSheetData.restruantds[0].id,
                            restruantdName: offerSheetData.restruantds[0].name
                        }, 'OfferSheet', function (err, result) {
                            if (result == 1) {

                                return resolve({code: 100});
                            }
                        });
                    }
                    //判断是否选择多个餐厅
                    else if (offerSheetData.restruantds.length > 1) {
                        var arry = new Array();
                        offerSheetData.restruantds.forEach(function (restruantd) {
                            var newofferSheetData = {
                                name: offerSheetData.name,
                                materials: offerSheetData.materials,
                                restruantdId: restruantd.id,
                                restruantdName: restruantd.name,
                                isPublic: offerSheetData.isPublic,
                                start: '1',
                                createUserId: offerSheetData.createUserId,
                                comfirmeUserId: userInfo.id,
                                supply_id: offerSheetData.supply_id,
                                supplyName: offerSheetData.supplyName
                            }
                            arry.push(Q.nfcall(mongodbDao.save, newofferSheetData, 'OfferSheet'));
                        });
                        Q.all(arry).then(function (datas) {
                            if (datas == ',' || datas.length == 0) {
                                return reject({code: 102});
                            }
                            mongodbDao.removeById(offerSheetData._id, 'OfferSheet', function (err, data) {
                                if (data == 1) {
                                    return resolve({code: 100, offerSheetDatas: datas});
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
 *对非公开主动报价的报价单进行修改
 * @param req
 * @param res
 */
exports.updateOfferSheer = function (req, res) {
    var offerSheetData = JSON.parse(req.body.offerSheetData);

    //进行非公开主动报价的报价单进行修改
    commitOfferSheetPromise(req, res, offerSheetData).then(function (resulte) {
        if (offerSheetData.restruantds.length == 1) {
            sendOfferSheetMteplate(offerSheetData._id, offerSheetData.restruantds[0].name, offerSheetData.restruantds[0].id);
        } else if (offerSheetData.restruantds.length > 1) {
            var offerSheetDatas = resulte.offerSheetDatas;
            //发送报价模版
            offerSheetDatas.forEach(function (offerSheets) {
                var restruantdId = offerSheets[0].restruantdId;
                var restruantdName = offerSheets[0].restruantdName;
                var id = offerSheets[0]._id + '';

                sendOfferSheetMteplate(id, restruantdName, restruantdId);
            });
        }
        //将这次报价的食材记录到食材表中
        userPromise(req, res).then(function (userInfo) {
            if (!userInfo) {
                return res.render('restaurant/login');
            } else {
                offerSheetData.materials.forEach(function (materail) {
                    var materialHistData = {
                        materialId: materail.material_id,
                        materialName: materail.material_name,
                        price: materail.price,
                        unit: materail.unit,
                        remark: materail.remark,
                        number: '0.00',
                        mechanismId: userInfo.mechanism_id,
                        mechanismName: userInfo.mechanism_name,
                        mechanismType: userInfo.userType
                    }
                    updateorsaveMaterialHis(materialHistData).then(function (data) {

                    }).done(null, function (err) {
                        console.log(err);
                    });
                });
            }
        });
        return res.json({code: 100})
    }).done(null, function (err) {
        return res.json({code: 101});
    });
}


//通过报价单id查询报价单
exports.showOfferSheetInfo = function (req, res) {
    var offerSheet = req.query.offerSheet;
    var offerSheetObj = JSON.parse(offerSheet);
    var start = offerSheetObj.start;
    var isPublic = offerSheetObj.isPublic;
    res.render('supply/offersheet/offerpriceComfirm', {
        title: '报价单确认报价',
        offerSheetData: JSON.stringify(offerSheetObj)
    });
}


/**
 * 针对餐厅询价单进行报价
 * @param req
 * @param res
 */
exports.offerToRestruantd = function (req, res) {
    var offerSheetData = JSON.parse(req.body.offerSheetData);
    var inquerySheetId = req.body.inquerySheetId;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var isConfirme = userInfo.isConfirme;
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
                return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }
            // 新建报价单
            var newOfferSheet = {
                name: offerSheetData.name,
                materials: offerSheetData.materials,
                supply_id: mechanism_id,
                supplyName: mechanism_name,
                isPublic: '0',  //默认为非公开报价单
                restruantdId: offerSheetData.restruantdId,
                restruantdName: offerSheetData.restruantdName,
                start: '0', //默认未报价
                createUserId: userInfo.id
            }
            mongodbDao.save(newOfferSheet, 'OfferSheet', function (err, datas) {
                if (datas) {
                    if (isConfirme == '1') {
                        mongodbDao.update({_id: new BSON.ObjectID(datas[0]._id)}, {
                            start: '1',
                            comfirmeUserId: userInfo.id
                        }, 'OfferSheet', function (err, resulte) {
                            mongodbDao.update({
                                _id: new BSON.ObjectID(inquerySheetId)
                            }, {start: '2'}, 'InquerySheet', function (err, resulteInq) {
                                //发送报价模板
                                sendOfferSheetMteplate(datas[0]._id, mechanism_name, offerSheetData.restruantdId);
                                //成功跳转页面
                                return res.json({code: 100, errmsg: '报价成功！'});
                            });
                        });
                    }
                    else {
                        return res.json({code: 500, errmsg: '没有报价权限，请联系管理员进行报价！'});
                    }
                }
            });

            //将这次报价的食材记录到食材表中
            offerSheetData.materials.forEach(function (materail) {
                var materialHistData = {
                    materialId: materail.material_id,
                    materialName: materail.material_name,
                    price: materail.price,
                    unit: materail.unit,
                    remark: materail.remark,
                    number: '0',
                    mechanismId: userInfo.mechanism_id,
                    mechanismName: userInfo.mechanism_name,
                    mechanismType: userInfo.userType
                }
                updateorsaveMaterialHis(materialHistData).then(function (data) {
                }).done(null, function (err) {
                    console.log(err);
                });
            });
        }
    });
}


//根据分餐厅ID查询总餐厅Id
function queryHeadRestruant(restruantId) {
    return Q.Promise(function (resolve, reject) {
        mongodbDao.queryBy({chainStoredIds: {$in: [restruantId]}}, 'Restruant', function (err, restruants) {
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


function sendOfferSheetMteplate(offerSheetId, supplyName, restruantdId) {
    queryHeadRestruant(restruantdId).then(function (restruantHeadId) {
        var restruantIdArray = new Array();
        if(restruantdId!=restruantHeadId){
            restruantIdArray.push(restruantHeadId.toString());
        }
        restruantIdArray.push(restruantdId.toString());
        Q.nfcall(mongodbDao.queryBy, {
            mechanism_id: {$in:restruantIdArray},
            userType: '1',
            userAuth: '1'
        }, 'User').then(function (users) {
            users.forEach(function (user) {
                sendMtemplate.sendMtemplate003(offerSheetId, supplyName, user.openId);
            });
        });
    });
}


/**
 * 选择物料配送的常用联系人（餐厅）
 * @param req
 * @param res
 */
exports.chooseContactDist = function (req, res) {
    var orderItem = JSON.parse(req.body.orderItem);
    var sum = req.body.sum;
    //查询常用联系人
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var type = userInfo.userType;
            var mechanism_id = userInfo.mechanism_id;
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
                    var restruantds = new Array();
                    fcontacts[0].contacts.forEach(function (contact) {
                        array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(contact)}, 'Restruant'));
                    });
                    Q.all(array).then(function (restruantdsArray) {

                        restruantdsArray.forEach(function (restruantdArray) {
                            if (restruantdArray.length >= 1) {
                                restruantds.push(restruantdArray[0]);
                            }
                        });
                        if (fcontacts.length == 0) {
                            return res.json({errmsg: '当前餐厅没用常联系供应商，请到添加常联系人'})
                        }
                        res.render('supply/offersheet/frequentContactDist', {
                            orderItem: JSON.stringify(orderItem),
                            sum: sum,
                            restruantds: JSON.stringify(restruantds)
                        });

                    });
                }
            });
        }
    });
}


/**
 *查询食材历史记录表
 * @param mechanismId 食材所属单位id（机构包括餐厅和供应商）
 * @param mechanismType 食材所属单位类型（1:餐厅 2: 供应商）
 * @param materialIds 所查询食材id数组，例如：［‘987654321’，‘123456789’］
 * @returns {*} 错误返回堆栈信息err，成功返回食材历史记录对象数组
 */
function queryMaterialHis(mechanismId, mechanismType, materialIds) {
    return Q.Promise(function (resolve, reject) {

        mongodbDao.queryBy({
            materialId: {$in: materialIds},
            mechanismId: mechanismId,
            mechanismType: mechanismType
        }, 'MaterialHistory', function (err, materials) {
            //查询错误，返回错误堆栈信息
            if (err) {
                return reject(err);
            }
            //返回食材历史记录对象数组
            if (materials) {
                return resolve(materials);
            } else {
                return resolve([]);
            }
        });
    });
}
exports.queryMaterialHis = queryMaterialHis;
/**
 *更新或者新增食材历史记录
 * @param materialhisData  需要更新，或者新增的数据
 * @returns {*}
 */
function updateorsaveMaterialHis(materialhisData) {

    return Q.Promise(function (resolve, reject) {
        var materialId = materialhisData.materialId ? materialhisData.materialId : '';
        var mechanismId = materialhisData.mechanismId ? materialhisData.mechanismId : '';
        var mechanismType = materialhisData.mechanismType ? materialhisData.mechanismType : '';
        if (!materialId) {
            return reject({code: 101, errmsg: '食材历史表更新，食材id为空'});
        }
        if (!mechanismId) {
            return reject({code: 101, errmsg: '食材历史表更新，食材所属单位id为空'});
        }
        if (!mechanismType) {
            return reject({code: 101, errmsg: '食材历史表更新，食材所属单位类型为空'});
        }
        mongodbDao.updateOrSave({
            mechanismId: mechanismId,
            mechanismType: mechanismType,
            materialId: materialId
        }, materialhisData, 'MaterialHistory', function (err, data) {
            if (err) {
                return reject(err);
            }
            if (data) {
                return resolve(data);
            }
        });
    });
}

exports.updateorsaveMaterialHis = updateorsaveMaterialHis;


//将公开询价的食材放到公开食材表中
function createSupplyPrice(materials, supply_id, supply_Name, contactNo) {

    console.info('1');
    //公开询价成功，对数据进行封装，入SupplyPrice库
    var array = new Array();
    materials.forEach(function (material) {
        var supplyPrice = {
            material_id: material.material_id,
            material_name: material.material_name,
            isOffer: material.isOffer,
            price: material.price,
            supply_id: supply_id,
            supply_Name: supply_Name,
            isPublic: '1',
            remark: material.remark,
            unit: material.unit,
            contactNo: contactNo
        }
        array.push(Q.nfcall(mongodbDao.updateOrSave, {material_id: material.material_id,supply_id:supply_id}, supplyPrice, 'SupplyPrice'));
        //对报价的食材进行增加报价数量
        array.push(Q.nfcall(mongodbDao.updateNotset, {
            _id: new BSON.ObjectID(material.material_id),
            supplysIds: {$nin: [supply_id]}
        }, {$inc: {supplyNum: 1}, $addToSet: {supplysIds: supply_id}}, 'Material'));
        //判断数据库最小价格是否大于报价价格，是则更新
        array.push(Q.nfcall(mongodbDao.update, {
            _id: new BSON.ObjectID(material.material_id),
            $or: [{minPrice: {$gt: material.price}}, {minPrice: {$exists: false}}, {minPrice: ''}]
        }, {minPrice: material.price}, 'Material'));
    });
    Q.all(array).then(function (result) {
        console.info('result:' + result);
        if (!result) {
            console.log('公共报价食材，放入公共食材表中失败');
        } else {
            console.log('公共报价食材，放入公共食材表中成功，并更新食材信息成功');
        }
    }).done(null, function (err) {
        console.log(err);
    });
}

exports.updateOfferSheetById = function(req,res){
    var offerSheetId = req.body.offerSheetId;
    console.info('offerSheetId:'+offerSheetId);
    mongodbDao.update({_id:new BSON.ObjectID(offerSheetId)},{start:'3'},'OfferSheet',function(err,result){
        if(err){
            res.json({code:500,message:err});
            console.log('更新报价单失败');
        }else if(!result){
            res.json({code:500,message:'更新失败'});
        }else{
            res.json({code:100,message:'成功'});
        }
    });
}

