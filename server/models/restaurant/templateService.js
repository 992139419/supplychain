//食材模版部分服务
var config = require('../../../config');
var mongodbDao = require('../../storage/mongodbDao');
var redisDao = require('../../storage/redisDao');
var commonUtil = require('../../helpers/commonUtil');
var underscore = require('underscore');
var Q = require('q');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var logger = require('../../log/logFactory').getLogger();
var userPromise = require('../userService').userPromise;
var _ = require('underscore')._;


/**
 * 根据模板id删除模板信息
 * @param req
 * @param res
 * @constructor
 */
exports.deleteTemplate = function (req, res) {
    var restaurant_id = req.body.restaurantId;
    if (restaurant_id == '' || restaurant_id == null) {
        console.log('DeletTmeplate error: no find the restaurantId');
        res.json({resulte: false});
    } else {
        mongodbDao.removeById(restaurant_id, 'Template', function (err, numberOfRemovedDocs) {
            if (err) {
                console.log(err);
                res.json({resulte: false})
            } else if (numberOfRemovedDocs > 0) {
                res.json({resulte: true});
            }
        });
    }
}

/**
 *获取该餐厅模板信息
 * @param req
 * @param res
 */

exports.getTemplate = function (req, res) {

    userPromise(req, res).then(function (userInfo) {

        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var number
            if (userInfo.number) {
                number = userInfo.number;
            } else {
                number = 0;
            }
            var mechanismId = userInfo.mechanism_id;
            var type = userInfo.userType;
            getTemplatePromise(mechanismId, type, number).then(function (templates) {

                if (type == 1) {
                    //时间转换
                    templates.forEach(function (template) {
                        template.createdAt = commonUtil.formatDate(template.createdAt, 'yyyy-MM-dd hh:mm:ss');
                    });
                    res.render('restaurant/template/my_template', {templates: templates});
                } else {
                    //时间转换
                    templates[0].forEach(function (template) {
                        template.createdAt = commonUtil.formatDate(template.createdAt, 'yyyy-MM-dd hh:mm:ss');
                    });
                    res.render('restaurant/template/my_template', {templates: templates[0]});
                }

            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
};


exports.getTemplatePromise = getTemplatePromise;

//根据模版所属机构ID获取所属模板
//old
//function getTemplatePromise(mechanismId, type,number) {
//    return Q.Promise(function (resolve, reject) {
//        mongodbDao.queryBy({mechanism_id: mechanismId, type: type}, 'Template', function (err, templates) {
//            if (err) {
//                return reject(err);
//            } else if (!templates) {
//                Q.resolve([]);
//            } else {
//                return resolve(templates);
//            }
//        });
//    })
//}

//模版分页查询方法
function getTemplatePromise(mechanismId, type, number) {

    return Q.Promise(function (resolve, reject) {

        //判断是否是为餐厅用户，是则判断该餐厅是否有分店，有则获取分店模板
        if (type == '1') {
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
                mongodbDao.pagingQuery({
                    mechanism_id: {$in: array},
                    type: type
                }, 'Template', {createdAt: -1}, number, number + 15, function (err, templates) {

                    if (err) {
                        return reject(err);
                    } else if (!templates) {
                        return resolve([]);
                    } else {
                        return resolve(templates);
                    }
                });
            });
        } else {
            if (!number) {
                number = 0
            }
            number = number * 15
            mongodbDao.pagingQuery({
                mechanism_id: mechanismId,
                type: type
            }, 'Template', {createdAt: -1}, number, number + 15, function (err, templates) {

                if (err) {
                    return reject(err);
                } else if (!templates) {
                    return resolve([]);
                } else {
                    if (number != 0) {
                        templates = [templates, 2]
                        return resolve(templates);
                    } else {
                        templates = [templates, 1]
                        return resolve(templates);

                    }
                }
            });
        }

    })
}


/**
 * 根据餐厅模板获取模板食材信息
 * @param req
 * @param res
 */
exports.intiMaterial = function (req, res) {
    var template;
    //判断是否有模板数据，有说明是修改操作

    if (req.body.template) {
        template = JSON.parse(req.body.template);
    }
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            var materialIdArray = new Array();
            var selectArray = new Array();
            var mechanism_id = userInfo.mechanism_id;
            var type = userInfo.userType;
            //判断是否是修改操作，如果是则获取已选中的模板种所选的食材信息
            if (template) {
                template.materials.forEach(function (material) {
                    materialIdArray.push(new BSON.ObjectID(material._id));
                    selectArray.push({_id: material._id, name: material.name});
                });
            }
            //查询所有的食材类型信心，以及不包含已选中食材的食材信息
            Q.all([mongodbDao.classQueryPromise({}, 'Category'),
                mongodbDao.pagingQueryPromise({isCustomer: {$ne: '1'}, _id: {$nin: materialIdArray}}, 'Material'),
                mongodbDao.pagingQueryPromise({
                    isCustomer: '1',
                    mechanism_id: mechanism_id,
                    mechanism_type: type,
                    _id: {$nin: materialIdArray}
                }, 'Material')]).then(function (feel) {

                if (feel == ',') {
                    console.log('并行查询结果都为空');
                    if (template) {
                        return res.render('restaurant/template/add_template', {
                            title: "食材选择",
                            categorys: [],
                            materials: [],
                            templateId: template._id,
                            selectArray: JSON.stringify([])
                        });
                    } else {
                        return res.render('restaurant/template/add_template', {
                            title: "食材选择",
                            categorys: [],
                            materials: [],
                            selectArray: JSON.stringify([])
                        });
                    }

                }
                var categorys = feel[0];
                var materials = feel[1];
                var customermaterials = feel[2];

                if (categorys.length == 0) {
                    console.log('没有食材类别信息');
                }
                //判断是否伟修改操作，如果是，则将该选中的模板中选择的食材和查询得食材进行合并操作，并返回页面
                if (template) {
                    materials = _.union(template.materials, materials, customermaterials);
                    return res.render('restaurant/template/update_template', {
                        title: "食材选择",
                        categorys: categorys,
                        materials: materials,
                        selectArray: JSON.stringify(selectArray),
                        templateId: template._id
                    });
                } else {
                    materials = _.union(materials, customermaterials);
                    return res.render('restaurant/template/add_template', {
                        title: "食材选择",
                        categorys: categorys,
                        materials: materials,
                        selectArray: JSON.stringify([])
                    });
                }
            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
}

/**
 * 根据食材类别id获取对应的食材物种
 * @param req
 * @param res
 */
exports.getMaterialByCgId = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var type = userInfo.userType;
            var category_Id = req.body.category_Id;
            //获取已选中得食材
            var selectArray = JSON.parse(req.body.selectArray);
            var materialIdArray = new Array();
            selectArray.forEach(function (select) {
                materialIdArray.push(new BSON.ObjectID(select._id));
            });
            if (category_Id === '0') {
                Q.all([Q.nfcall(mongodbDao.queryAdv, 'Material', {
                    isCustomer: {$ne: '1'},
                    _id: {$in: materialIdArray}
                }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: {$ne: '1'},
                        _id: {$nin: materialIdArray}
                    }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: '1',
                        mechanism_id: mechanism_id,
                        mechanism_type: type,
                        _id: {$nin: materialIdArray}
                    }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: '1',
                        mechanism_id: mechanism_id,
                        mechanism_type: type,
                        _id: {$in: materialIdArray}
                    }, {_id: 1, name: 1}, {})]).then(function (feel) {

                    if (feel == ',') {
                        return res.json({materials: []});
                    } else {
                        var materials = _.union(feel[0], feel[3], feel[1], feel[2]);
                        return res.json({materials: materials});
                    }
                }).done(null, function (err) {
                    console.log(err);
                    return res.json(null);
                });
            }
            //判断是否未自定义食材查询
            else if (category_Id === '1') {
                var array = new Array();
                array.push(Q.nfcall(mongodbDao.queryAdv, 'Material', {
                    isCustomer: '1',
                    mechanism_id: mechanism_id,
                    mechanism_type: type,
                    _id: {$nin: materialIdArray}
                }, {_id: 1, name: 1}, {}));
                array.push(Q.nfcall(mongodbDao.queryAdv, 'Material', {
                    isCustomer: '1',
                    mechanism_id: mechanism_id,
                    mechanism_type: type,
                    _id: {$in: materialIdArray}
                }, {_id: 1, name: 1}, {}));
                Q.all(array).then(function (feel) {
                    if (!feel) {
                        return res.json({materials: []});
                    } else if (feel === ',') {
                        return res.json({materials: []});
                    } else {
                        var materials = _.union(feel[1], feel[0]);
                        return res.json({materials: materials});
                    }
                });
            } else {
                Q.all([Q.nfcall(mongodbDao.queryAdv, 'Material', {
                    isCustomer: {$ne: '1'},
                    categoryId: category_Id,
                    _id: {$nin: materialIdArray}
                }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: {$ne: '1'},
                        categoryId: category_Id,
                        _id: {$in: materialIdArray}
                    }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: '1',
                        categoryId: category_Id,
                        mechanism_id: mechanism_id,
                        mechanism_type: type,
                        _id: {$nin: materialIdArray}
                    }, {_id: 1, name: 1}, {}),
                    Q.nfcall(mongodbDao.queryAdv, 'Material', {
                        isCustomer: '1',
                        categoryId: category_Id,
                        mechanism_id: mechanism_id,
                        mechanism_type: type,
                        _id: {$in: materialIdArray}
                    }, {_id: 1, name: 1}, {})]).then(function (feel) {

                    if (feel == ',') {
                        return res.json({materials: []});
                    } else {
                        var materials = _.union(feel[1], feel[3], feel[0], feel[2]);
                        return res.json({materials: materials});
                    }

                }).done(null, function (err) {
                    logger.log(err);
                    return res.json(null);
                });
            }

        }
    });

}


exports.templateConfirm = function (req, res) {
    var selectMaterials = JSON.parse(req.body.selectMaterial);
    var templateId = req.body.templateId;
    var array = new Array();
    selectMaterials.forEach(function (selectMaterial) {
        array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(selectMaterial._id)}, 'Material'));

    });
    Q.all(array).then(function (materials) {
        var materialArray = new Array();
        materials.forEach(function (material) {
            if (material && material.length > 0) {

                materialArray.push(material[0]);
            }
        });

        //生成时间搓,取第一个食材名加时间搓生成默认模板名
        var date = new Date();
        var newdate = commonUtil.formatDate(date, 'yyyyMMdd');

        var templateName = !materialArray[0] == false ? materialArray[0].name + newdate : '' + newdate;

        return res.render('restaurant/template/template_confirm', {
            title: '添加模板',
            selectMaterials: JSON.stringify(materialArray),
            templateName: templateName
        });
    });
}


exports.templateConfirmUpdate = function (req, res) {
    userPromise(req,res).then(function(userInfo){
        var isGuest = userInfo.isGuest;//判断是否为游客身份，1为不是；0为是
        if(isGuest==0){
            return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
        }
        var selectMaterials = JSON.parse(req.body.selectMaterial);
        var templateId = req.body.templateId;
        var array = new Array();
        selectMaterials.forEach(function (selectMaterial) {
            array.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(selectMaterial._id)}, 'Material'));

        });
        Q.all(array).then(function (selectMaterialArray) {
            var materialArray = new Array();
            mongodbDao.findById(templateId, 'Template', function (err, template) {
                if (template) {
                    var templateName = template.name;
                    var materials = template.materials;
                    selectMaterialArray.forEach(function (selectMaterials) {
                        if (selectMaterials && selectMaterials.length > 0) {
                            var index = -1;
                            for (var i = 0, size = materials.length; i < size; i++) {
                                if (materials[i]._id == selectMaterials[0]._id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index != -1) {
                                materialArray.push(materials[index]);
                            } else {
                                materialArray.push(selectMaterials[0]);
                            }
                        }

                    });
                }

                return res.render('restaurant/template/templateMaterialList', {
                    title: '修改模板',
                    selectMaterials: JSON.stringify(materialArray),
                    templateId: templateId,
                    templateName:templateName
                });
            });

        });
    });

}


/**
 * 添加模板
 * @param req
 * @param res
 */
exports.addTemplateservice = function (req, res) {
    var selectMaterials = JSON.parse(req.body.selectMaterials);
    var templateName = req.body.templateName;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('restaurant/login');
        } else {
            var type = userInfo.userType;
            var mechanismId = userInfo.mechanism_id;
            var isGuest = userInfo.isGuest;
            //判断是否为游客身份，1为不是；0为是
            if(isGuest==0){
               return res.render('admin/remind01',{msg:'您当前还是一名游客，请点击免费使用。'});
            }
            addTemplate(selectMaterials, templateName, mechanismId, type).then(function (data) {
                if (data) {
                    res.redirect('/myTempalte?openId=' + userInfo.openId);
                }
            });
        }
    });
}

/**
 * 模板添加公共方法
 * @param req
 * @param res
 * @param selectMaterials
 * @param templateName
 * @returns {*}
 */
function addTemplate(selectMaterials, templateName, mechanismId, type) {
    return Q.Promise(function (resolve, reject) {
        var templateData = {
            name: templateName,
            materials: selectMaterials,
            type: type,
            mechanism_id: mechanismId
        };
        mongodbDao.save(templateData, 'Template', function (err, data) {
            if (err) {
                logger.error('数据库操作问题');
                return reject(err);
            } else {
                return resolve(data);
            }
        });


    });
}

/**
 * 获取所选模板的食材信息
 * @param materialstr 食材id字符串。例如: 1,2,3,4,5,6
 */
exports.getMaterialList = function (materialstr) {
    return Q.Promise(function (resolve, reject) {
        var materials = materialstr.split(',');
        var queryArrat = new Array();
        materials.forEach(function (material) {
            queryArrat.push(Q.nfcall(mongodbDao.queryBy, {_id: new BSON.ObjectID(material)}, 'Material'));
        });
        Q.all(queryArrat).then(function (fell) {
            if (fell == ',') {
                return resolve([]);
            } else {
                var materials = new Array();
                fell.forEach(function (material) {
                    if (material.length > 0) {
                        materials.push(material[0]);
                    }
                });
                return resolve(materials);
            }
        }).done(function (err) {
            console.log(err);
            return reject(err);
        });
    });

}


/**
 * 选择食材以便查看其价格趋势图
 * @param req
 * @param res
 */
exports.selectMaterialPT = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            Q.all([mongodbDao.classQueryPromise({}, 'Category'),
                mongodbDao.pagingQueryPromise({}, 'Material', 0, 20)]).then(function (feel) {

                if (feel == ',') {
                    return res.render('restaurant/my/selectMaterialPT', {
                        title: "关注的供应商",
                        categorys: [],
                        materials: []
                    });
                }

                var categorys = feel[0];
                var materials = feel[1];
                return res.render('restaurant/my/selectMaterialPT', {
                    title: "关注的供应商",
                    categorys: categorys,
                    materials: materials
                });
            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
}

/**
 * 选择食材以便查看其价格趋势图
 * @param req
 * @param res
 */
exports.viewMaterialPT = function (req, res) {
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            Q.all([mongodbDao.classQueryPromise({}, 'Category'),
                mongodbDao.pagingQueryPromise({}, 'Material', 0, 20)]).then(function (feel) {

                if (feel == ',') {
                    return res.render('restaurant/my/viewMaterialPT', {title: "关注的供应商", categorys: [], materials: []});
                }

                var categorys = feel[0];
                var materials = feel[1];
                return res.render('restaurant/my/viewMaterialPT', {
                    title: "关注的供应商",
                    categorys: categorys,
                    materials: materials
                });
            }).done(null, function (err) {
                console.log(err);
            });
        }
    });
}

//新加
exports.newmokuai = function (req, res) {
    var mechanismId = req.body.mechanismId
    var type = req.body.type;
    var number = req.body.number
    var numberq = number * 15;
    Q.promise(function (resolve, reject) {

        return mongodbDao.pagingQuery({mechanism_id: mechanismId, type: type}, 'Template', numberq, numberq + 15);

    }).then(function (resolve) {
        console.log(resolve);

    }).then(function (reject) {
        console.log(reject);
    });

    mongodbDao.pagingQuery({
        mechanism_id: mechanismId,
        type: type
    }, 'Template', {createdAt: -1}, numberq, numberq + 15, function (err, templates) {
        if (err) {
            console.log(err);
        } else {
            res.json(templates);
        }
    })
}


/**
 *修改模板操作
 * @param req
 * @param res
 */
exports.updateTemplate = function (req, res) {
    var templateId = req.body.templateId;
    var selectMaterials = JSON.parse(req.body.selectMaterials);
    var templateName = req.body.templateName;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            mongodbDao.update({_id: new BSON.ObjectID(templateId)}, {materials: selectMaterials,name:templateName}, 'Template', function (err, data) {
                res.redirect('/myTempalte?openId=' + userInfo.openId);
            });
        }
    });
}


/**
 * 查询自定食材
 * @param selector 查询条件
 * @returns {*} 成功返回自定义食材信息数组
 */
function queryCustomerMaterial(selector) {
    return Q.Promise(function (resolve, reject) {
        mongodbDao.queryBy(selector, 'Material', function (err, result) {
            if (err) {
                console.log(err);
                return reject({code: 500, msg: err});
            } else if (!result) {
                console.log('queryCustomerMaterial:查询自定义食材数据库操作失败')
                return reject({code: 500, msg: '查询自定义食材数据库操作失败'});
            } else {
                return resolve(result);
            }
        });
    });
}

//增加自定义食材
function addCustomerMaterialPromise(materail) {
    return Q.Promise(function (resolve, reject) {
        mongodbDao.save(materail, 'Material', function (err, result) {
            if (err) {
                console.log(err);
                return reject({code: 500, msg: err});
            } else if (!result) {
                console.log('addCustomerMaterial:增加自定义食材');
                return reject({code: 500, msg: 'addCustomerMaterial:增加自定义食材'});
            } else {
                return resolve(result);
            }
        });
    });
}
//增加自定义食材
function updateCustomerMaterialPromise(id, materail) {
    return Q.Promise(function (resolve, reject) {
        mongodbDao.update({_id: new BSON.ObjectID(id)}, materail, 'Material', function (err, result) {
            if (err) {
                console.log(err);
                return reject({code: 500, msg: err});
            } else if (!result) {
                console.log('addCustomerMaterial:修改自定义食材');
                return reject({code: 500, msg: 'addCustomerMaterial:修改自定义食材'});
            } else {
                return resolve(result);
            }
        });
    });
}


/**
 * 增添自定义食材
 * @param req
 * @param res
 */
exports.addCuMaterial = function (req, res) {
    //查询食材类别
    Q.nfcall(mongodbDao.queryBy, {}, 'Category').then(function (crategorys) {
        if (!crategorys) {
            return [];
        } else {
            return crategorys;
        }
    }).then(function (crategorys) {
        return res.render('restaurant/template/customerMaterailDetial', {title: '添加自定义食材', crategorys: crategorys});
    }).catch(function (err) {
        console.log(err);
    });

}

/**
 * 新增自定义食材
 * @param req
 * @param res
 */
exports.addCustomerMaterial = function (req, res) {

    var name = req.body.name;
    var minPrice = req.body.minPrice;
    var categoryId = req.body.categoryId;
    var categoryName = req.body.categoryName;
    var remark = req.body.remark;
    var unit = req.body.unit;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var userType = userInfo.userType;
            var customerMaterial = {
                name: name,
                minPrice: minPrice,
                categoryId: categoryId,
                categoryName: categoryName,
                unit: unit,
                remark: remark,
                mechanism_id: mechanism_id,
                mechanism_name: mechanism_name,
                mechanism_type: userType,
                isCustomer: '1'
            }
            addCustomerMaterialPromise(customerMaterial).then(function (result) {
                if (result) {
                    return res.json({code: 100});
                }
            }).done(null, function (err) {
                console.log(err);
                return res.json({code: 500, msg: err})
            });
        }
    });
}

//食材搜素功能
exports.searchMaterial = function (req, res) {
    var materialName = req.body.materialName;

    mongodbDao.queryBy({name: {$regex: materialName}}, 'Material', function (err, materails) {
        if (err) {
            console.log(err);
            return res.json({code: 500, msg: err});
        } else {
            return res.json({materials: materails});
        }
    });
}

/**
 * 修改自定义食材页面跳转
 * @param req
 * @param res
 */
exports.updateCuMaterial = function (req, res) {
    var id = req.query.id;
    var select = {_id: new BSON.ObjectID(id)}
    var cusMaterial;
    queryCustomerMaterial(select).then(function (cusMaterials) {
        cusMaterial = cusMaterials[0];
        return Q.nfcall(mongodbDao.queryBy, {}, 'Category');
    }).then(function (crategorys) {
        if (!crategorys) {
            return [];
        } else {
            return crategorys;
        }
    }).then(function (crategorys) {

        return res.render('restaurant/template/upadtecusMaterailDetial', {
            cusMaterial: JSON.stringify(cusMaterial),
            crategorys: crategorys
        })
    }).catch(function (err) {
        console.log(err);
    }).done(null, function (err) {
        console.log(err);
    });
}

/**
 * 新增自定义食材
 * @param req
 * @param res
 */
exports.updateCustomerMaterial = function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var minPrice = req.body.minPrice;
    var categoryId = req.body.categoryId;
    var categoryName = req.body.categoryName;
    var remark = req.body.remark;
    var unit = req.body.unit;
    userPromise(req, res).then(function (userInfo) {
        if (!userInfo) {
            return res.render('/restaurant/login');
        } else {
            var mechanism_id = userInfo.mechanism_id;
            var mechanism_name = userInfo.mechanism_name;
            var userType = userInfo.userType;
            var customerMaterial = {
                name: name,
                minPrice: minPrice,
                categoryId: categoryId,
                categoryName: categoryName,
                unit: unit,
                remark: remark,
                mechanism_id: mechanism_id,
                mechanism_name: mechanism_name,
                mechanism_type: userType,
                isCustomer: '1'
            }
            updateCustomerMaterialPromise(id, customerMaterial).then(function (result) {
                if (result) {
                    return res.json({code: 100});
                }
            }).done(null, function (err) {
                console.log(err);
                return res.json({code: 500, msg: err})
            });
        }
    });
}

//删除自定义食材
exports.deleteCustomerMaterial = function (req, res) {
    var id = req.body.id;
    mongodbDao.removeById(id, 'Material', function (err, result) {
        if (err) {
            console.log(err);
            return res.json({code: 500, msg: err});
        } else {

            return res.json({code: 100});
        }
    });
}