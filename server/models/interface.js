/**
 * Created by user on 15/8/10.
 */

var config = require('../../config');
var mongodaDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var underscore = require('underscore');
var fs = require('fs');
var BSON = require('mongodb').BSONPure;
var userPromise = require('./userService').userPromise;
var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID
var url = require('url');
var urlencode = require('urlencode');
var request = require('request');
var Q = require('q');

/**
 * 查询食材基本信息接口
 * @param req
 * @param res
 * @return data{_id,name,categoryId,categoryName,price,unit}
 */
exports.queryMaterialInfo = function (req, res) {
    //查询食材信息
    mongodaDao.queryAdv('Material', {}, {
        _id: 1,
        name: 1,
        categoryId: 1,
        categoryName: 1,
        price: 1,
        unit: 1
    }, {}, function (err, materialArray) {
        if (err) {
            return res.json({code: 500, data:[],message: '系统接口出错！'});
        }
        return res.json({code: 100, data: materialArray ,message:'成功'});
    });
}


/**
 * 查询餐厅或供应商的已验收订单信息接口
 * @param req
 * @param res
 * @return data{_id,name,categoryId,categoryName}
 */
exports.queryOrderInfo = function (req, res) {
    var mechanism_id = req.query.code;
    var type = req.query.type;
    var collect = '';
    var field = '';
    //判断必填参数
    if (!mechanism_id) {
        return res.json({code: 401,data:[], message: '识别码不能为空'});
    }
    if(mechanism_id.length!=24){
        return res.json({code: 400,data:[], message: '该餐厅识别码格式错误'});
    }
    if (!type) {
        return res.json({code: 402,data:[], message: '识别类型不能为空'});
    }
    if (type === '1') {
        collect = 'Restruant';
    } else if (type === '2') {
        //判断识别码是否存在
        collect = 'Supply';
    } else {
        return res.json({code: 403,data:[], message: '识别类型超出范围值'});
    }
    //判断识别码是否存在
    Q.nfcall(mongodaDao.queryBy, {_id: new BSON.ObjectID(mechanism_id)}, collect).then(function (restruant) {

        if (!restruant) {
            return 404;
        } else if (restruant.length < 1) {
            return 404;
        } else {
            if(type === '1'){
                return Q.nfcall(mongodaDao.queryBy, {restruantId: mechanism_id, orderStatus: 'R',isSynchronous:{$ne:'1'}}, 'Orders');
            }else{
                return Q.nfcall(mongodaDao.queryBy, {toSupply: mechanism_id, orderStatus: 'R',isSynchronous:{$ne:'1'}}, 'Orders');
            }
        }
        //获取该餐厅已经验收的订单
    }).then(function (orderArray) {
        if (orderArray == 404) {
            return res.json({code: 404, data:[],message: '餐厅或供应商识别码不存在'});
        } else {
            var array = new Array();
            orderArray.forEach(function(order){
                var data = {
                    orderNo:order.orderNo,
                    materialArray:order.orderItem,
                    orderStatus:order.orderStatus,
                    supplyNo:order.toSupply,
                    supplyName:order.supplyName,
                    restruantNo:order.restruantId,
                    restruantName:order.restruantName,
                    receiverName:order.receiver
                }
                array.push(data);
            })
            return res.json({code: 100, data: array,message:'成功'});
        }
    }).done(null, function (err) {
        console.error(err);
        return res.json({code: 500, data:[],message: '系统接口出错'});
    });
}


/**
 * 修改已经验收订单的同步状态
 * @param req
 * @param res
 */
exports.upDataOrderSynchronous = function (req, res) {
    var orderNo = req.query.orderNo;
    if(!orderNo){
        return res.json({code:400,message:'订单编号不能为空'});
    }
    //查询是否存在该订单
    Q.nfcall(mongodaDao.queryBy,{orderNo:orderNo,orderStatus:'R'},'Orders').then(function(data){
       if(!data){
           return 401;
       }else if(data.length<1){
           return 401;
       }else{
         return  Q.nfcall(mongodaDao.update,{orderNo:orderNo,orderStatus:'R'},{isSynchronous:'1'},'Orders');
       }
    }).then(function(result){
        console.info(result);
        if(result==401){
            return res.json({code:401,message:'不存在编号为'+orderNo+'的已验收订单'});
        }else{
            if(!result){
                return res.json({code:402,message:'数据库操作失败'});
            }else if(result.length<1){
                return res.json({code:402,message:'数据库操作失败'});
            }else if(result[0]!=1){
                return res.json({code:403,message:'修改失败'});
            }else{
                return res.json({code:100,message:'成功'});
            }
        }
    }).done(null, function (err) {
        console.error(err);
        return res.json({code: 500, message: '系统接口出错'});
    });;
}