/**
 * Created by tangnian on 15/3/3.
 * 组件服务
 *
 */
var config = require('../../config');
var ossConfig = require('../../oss');
var mongodbDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var commonUtil = require('../helpers/commonUtil');
var Q = require('q');
var ejs = require('ejs');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();



