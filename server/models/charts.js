/**
 * Created by weilongfei on 15/6/10.
 */
var mongodbDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();
var Q = require('q');
var url = require('url');
var http = require('http');
var request = require('request');

function GetDateStr(AddDayCount)
{
    var dd = new Date();
    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth()+1;//获取当前月份的日期
    var d = dd.getDate();
    return y+"-"+m+"-"+d;
}



exports.chartsQ = function (req, res) {
    var startDate = GetDateStr(-5);
    var endDate = GetDateStr(+2);
var start =0
    mongodbDao.pagingQuery({createdAt:{$gt: new Date(startDate), $lte: new Date(endDate)},aaterialID: '55750b7267a90af0540bbef7'},'Charts',{createdAt: 1},start, start + 7,function(err,data){
        if (data[0]){
            res.json(data)
        }
    })
}


