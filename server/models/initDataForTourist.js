
var mongodaDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var BSON = require('mongodb').BSONPure;
var logger = require('../log/logFactory').getLogger();
var Q = require('q');
var url = require('url');
var sms = require('./sms');
var request = require('request');

/**
 * 初始化游客餐厅数据
 * @param id 游客餐厅id
 */
exports.initRestruantData = function(id,name){
    //初始化餐厅模版数据
    //模版数据1
    var TempleteData1 = {
        "name" : "猪肉要货单",
        "materials" : [
            {
                "_id" : "559a28bd2581208123beab29",
                "name" : "方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:33.418Z"
            },
            {
                "_id" : "559a28cd2581208123beab2a",
                "name" : "夹心肉糜",
                "price" : "13.3",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:49.022Z"
            },
            {
                "_id" : "559a29162581208123beab2b",
                "name" : "肉丝（员）",
                "price" : "13",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:07:02.319Z"
            },
            {
                "_id" : "559a2a1a2581208123beab2c",
                "name" : "纯精肉",
                "price" : "15",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:22.374Z"
            },
            {
                "_id" : "559a2a2d2581208123beab2d",
                "name" : "肥牛肉",
                "price" : "7",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-06T07:11:41.816Z"
            },
            {
                "_id" : "559a2a3b2581208123beab2e",
                "name" : "崇明咸方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:55.361Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.695Z"
            },
            {
                "_id" : "559a2a4a2581208123beab2f",
                "name" : "肋排",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:10.462Z"
            },
            {
                "_id" : "559a2a5b2581208123beab30",
                "name" : "猪肝",
                "price" : "12",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:27.082Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.694Z"
            },
            {
                "_id" : "559a2a682581208123beab31",
                "name" : "肥肉丁",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:40.781Z"
            },
            {
                "_id" : "559a2a762581208123beab32",
                "name" : "猪占",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:54.504Z"
            },
            {
                "_id" : "559a2a832581208123beab33",
                "name" : "双汇猪手",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:07.073Z"
            },
            {
                "_id" : "559a2a9a2581208123beab34",
                "name" : "肺头",
                "price" : "5",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "只",
                "createdAt" : "2015-07-06T07:13:30.134Z"
            },
            {
                "_id" : "559a2aa52581208123beab35",
                "name" : "肥肉丝",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:41.269Z"
            },
            {
                "_id" : "559a2ab12581208123beab36",
                "name" : "大肠头",
                "price" : "22",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:53.902Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.691Z"
            },
            {
                "_id" : "559a2abe2581208123beab37",
                "name" : "肚子",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:06.873Z"
            },
            {
                "_id" : "559a2acc2581208123beab38",
                "name" : "3号肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:20.238Z"
            }
        ],
        "type" : "1",
        "mechanism_id" : id
    };
    var templeteData2 = {
        "name" : "蔬菜要货单",
        "materials" : [
            {
                "_id" : "55963df2790907040638d957",
                "name" : "青菜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:46:58.680Z",
                "updatedAt" : "2015-08-10T07:56:19.037Z"
            },
            {
                "_id" : "55963e11790907040638d959",
                "name" : "草头",
                "price" : "7",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:47:29.907Z",
                "updatedAt" : "2015-07-03T08:37:07.451Z"
            },
            {
                "_id" : "55963e97790907040638d95a",
                "name" : "蒜肉",
                "price" : "4.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:43.764Z",
                "updatedAt" : "2015-07-03T08:37:24.777Z"
            },
            {
                "_id" : "55963ea6790907040638d95b",
                "name" : "老姜",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:58.344Z",
                "updatedAt" : "2015-07-03T08:38:25.681Z"
            },
            {
                "_id" : "55963ee6790907040638d95c",
                "name" : "毛菜",
                "price" : "2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:02.833Z",
                "updatedAt" : "2015-07-03T08:38:37.207Z"
            },
            {
                "_id" : "55963efe790907040638d95d",
                "name" : "肉葱",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:26.929Z",
                "updatedAt" : "2015-07-03T08:38:48.619Z"
            },
            {
                "_id" : "55963f15790907040638d95e",
                "name" : "绢豆腐",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "合",
                "createdAt" : "2015-07-03T07:51:49.623Z",
                "updatedAt" : "2015-07-03T08:39:06.262Z"
            },
            {
                "_id" : "55963f27790907040638d95f",
                "name" : "香菜",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:07.593Z",
                "updatedAt" : "2015-07-03T08:39:25.357Z"
            },
            {
                "_id" : "55963f38790907040638d960",
                "name" : "荷兰黄瓜",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:24.824Z",
                "updatedAt" : "2015-07-03T08:39:44.866Z"
            },
            {
                "_id" : "55963f47790907040638d961",
                "name" : "球生菜",
                "price" : "5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:39.578Z",
                "updatedAt" : "2015-07-03T08:39:56.676Z"
            },
            {
                "_id" : "55963f57790907040638d962",
                "name" : "黄瓜苗",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:55.185Z",
                "updatedAt" : "2015-07-03T08:40:11.711Z"
            },
            {
                "_id" : "55963f6a790907040638d963",
                "name" : "红椒",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:53:14.434Z",
                "updatedAt" : "2015-07-03T08:40:20.306Z"
            },
            {
                "_id" : "55963fc7790907040638d964",
                "name" : "小园子",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:54:47.243Z",
                "updatedAt" : "2015-07-03T08:40:39.039Z"
            },
            {
                "_id" : "55963fe0790907040638d965",
                "name" : "豆苗",
                "price" : "5.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:55:12.083Z",
                "updatedAt" : "2015-07-03T08:41:11.448Z"
            },
            {
                "_id" : "55963ff6790907040638d966",
                "name" : "青大蒜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:34.842Z",
                "updatedAt" : "2015-07-03T08:42:44.206Z"
            },
            {
                "_id" : "5596400d790907040638d967",
                "name" : "茶树菇",
                "price" : "9.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:57.294Z",
                "updatedAt" : "2015-07-03T08:42:55.496Z"
            }
        ],
        "type" : "1",
        "mechanism_id" :id
    };
    //初始化游客供应商模版数据
    var TempleteData3 = {
        "name" : "猪肉要货单",
        "materials" : [
            {
                "_id" : "559a28bd2581208123beab29",
                "name" : "方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:33.418Z"
            },
            {
                "_id" : "559a28cd2581208123beab2a",
                "name" : "夹心肉糜",
                "price" : "13.3",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:49.022Z"
            },
            {
                "_id" : "559a29162581208123beab2b",
                "name" : "肉丝（员）",
                "price" : "13",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:07:02.319Z"
            },
            {
                "_id" : "559a2a1a2581208123beab2c",
                "name" : "纯精肉",
                "price" : "15",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:22.374Z"
            },
            {
                "_id" : "559a2a2d2581208123beab2d",
                "name" : "肥牛肉",
                "price" : "7",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-06T07:11:41.816Z"
            },
            {
                "_id" : "559a2a3b2581208123beab2e",
                "name" : "崇明咸方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:55.361Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.695Z"
            },
            {
                "_id" : "559a2a4a2581208123beab2f",
                "name" : "肋排",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:10.462Z"
            },
            {
                "_id" : "559a2a5b2581208123beab30",
                "name" : "猪肝",
                "price" : "12",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:27.082Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.694Z"
            },
            {
                "_id" : "559a2a682581208123beab31",
                "name" : "肥肉丁",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:40.781Z"
            },
            {
                "_id" : "559a2a762581208123beab32",
                "name" : "猪占",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:54.504Z"
            },
            {
                "_id" : "559a2a832581208123beab33",
                "name" : "双汇猪手",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:07.073Z"
            },
            {
                "_id" : "559a2a9a2581208123beab34",
                "name" : "肺头",
                "price" : "5",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "只",
                "createdAt" : "2015-07-06T07:13:30.134Z"
            },
            {
                "_id" : "559a2aa52581208123beab35",
                "name" : "肥肉丝",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:41.269Z"
            },
            {
                "_id" : "559a2ab12581208123beab36",
                "name" : "大肠头",
                "price" : "22",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:53.902Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.691Z"
            },
            {
                "_id" : "559a2abe2581208123beab37",
                "name" : "肚子",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:06.873Z"
            },
            {
                "_id" : "559a2acc2581208123beab38",
                "name" : "3号肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:20.238Z"
            }
        ],
        "type" : "2",
        "mechanism_id" : '55ddcd4aa59a8ff844407ecb'
    };
    //小白菜供应商数据
    var templeteData4 = {
        "name" : "蔬菜要货单",
        "materials" : [
            {
                "_id" : "55963df2790907040638d957",
                "name" : "青菜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:46:58.680Z",
                "updatedAt" : "2015-08-10T07:56:19.037Z"
            },
            {
                "_id" : "55963e11790907040638d959",
                "name" : "草头",
                "price" : "7",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:47:29.907Z",
                "updatedAt" : "2015-07-03T08:37:07.451Z"
            },
            {
                "_id" : "55963e97790907040638d95a",
                "name" : "蒜肉",
                "price" : "4.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:43.764Z",
                "updatedAt" : "2015-07-03T08:37:24.777Z"
            },
            {
                "_id" : "55963ea6790907040638d95b",
                "name" : "老姜",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:58.344Z",
                "updatedAt" : "2015-07-03T08:38:25.681Z"
            },
            {
                "_id" : "55963ee6790907040638d95c",
                "name" : "毛菜",
                "price" : "2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:02.833Z",
                "updatedAt" : "2015-07-03T08:38:37.207Z"
            },
            {
                "_id" : "55963efe790907040638d95d",
                "name" : "肉葱",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:26.929Z",
                "updatedAt" : "2015-07-03T08:38:48.619Z"
            },
            {
                "_id" : "55963f15790907040638d95e",
                "name" : "绢豆腐",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "合",
                "createdAt" : "2015-07-03T07:51:49.623Z",
                "updatedAt" : "2015-07-03T08:39:06.262Z"
            },
            {
                "_id" : "55963f27790907040638d95f",
                "name" : "香菜",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:07.593Z",
                "updatedAt" : "2015-07-03T08:39:25.357Z"
            },
            {
                "_id" : "55963f38790907040638d960",
                "name" : "荷兰黄瓜",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:24.824Z",
                "updatedAt" : "2015-07-03T08:39:44.866Z"
            },
            {
                "_id" : "55963f47790907040638d961",
                "name" : "球生菜",
                "price" : "5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:39.578Z",
                "updatedAt" : "2015-07-03T08:39:56.676Z"
            },
            {
                "_id" : "55963f57790907040638d962",
                "name" : "黄瓜苗",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:55.185Z",
                "updatedAt" : "2015-07-03T08:40:11.711Z"
            },
            {
                "_id" : "55963f6a790907040638d963",
                "name" : "红椒",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:53:14.434Z",
                "updatedAt" : "2015-07-03T08:40:20.306Z"
            },
            {
                "_id" : "55963fc7790907040638d964",
                "name" : "小园子",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:54:47.243Z",
                "updatedAt" : "2015-07-03T08:40:39.039Z"
            },
            {
                "_id" : "55963fe0790907040638d965",
                "name" : "豆苗",
                "price" : "5.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:55:12.083Z",
                "updatedAt" : "2015-07-03T08:41:11.448Z"
            },
            {
                "_id" : "55963ff6790907040638d966",
                "name" : "青大蒜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:34.842Z",
                "updatedAt" : "2015-07-03T08:42:44.206Z"
            },
            {
                "_id" : "5596400d790907040638d967",
                "name" : "茶树菇",
                "price" : "9.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:57.294Z",
                "updatedAt" : "2015-07-03T08:42:55.496Z"
            }
        ],
        "type" : "2",
        "mechanism_id" :'55ddcd4aa59a8ff844407ecb'
    };
    var order1 =
    {
        "orderNo" : "E2015082611592478494880",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "18"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "13",
                "paidIn" : "12"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "34",
                "paidIn" : "34"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "5",
                "paidIn" : "5"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "6",
                "paidIn" : "6"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "8",
                "paidIn" : "8"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "12",
                "paidIn" : "12"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : '55ddcd4aa59a8ff844407ecb',
        "sum" : "6672.8",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" :name,
        "mobile" : "15999999999",
        "receiverId" : "55dd2d4d02a9354f423d29fc",
        "receiver" : "仓库小冯",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "R"
    }
    var order2 ={
        "orderNo" : "E2015082612004089504662",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "35",
                "paidIn" : "35"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "25",
                "paidIn" : "25"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "23",
                "paidIn" : "23"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "12",
                "paidIn" : "12"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "23",
                "paidIn" : "23"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "35",
                "paidIn" : "35"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "13",
                "paidIn" : "13"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "34",
                "paidIn" : "34"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "37",
                "paidIn" : "37"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : "55ddcd4aa59a8ff844407ecb",
        "sum" : "2112.29",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" : name,
        "mobile" : "15999999999",
        "receiverId" : "55dd2d4d02a9354f423d29fc",
        "receiver" : "仓库小冯",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "R"
    }
    var order3 ={
        "orderNo" : "E2015082612090299735191",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "14"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "21"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "18"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : "55ddcd4aa59a8ff844407ecb",
        "sum" : "5001.8",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" :name ,
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "S"
    };

    var order4 = {
        "orderNo" : "E2015082612105173437465",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "14"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "4"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "6"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "27"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "17"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : "55ddcd4aa59a8ff844407ecb",
        "sum" : "1487.4",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" :name ,
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "S"
    };

    var order5 = {
        "orderNo" : "E2015082612135711647674",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "25"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "4"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "11"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "21"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "24"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "34"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "17"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : "55ddcd4aa59a8ff844407ecb",
        "sum" : "6145.1",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" : name,
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "N"
    };
    var order6 ={
        "orderNo" : "E2015082612150271323653",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "24"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : "55ddcd4aa59a8ff844407ecb",
        "sum" : "1039.14",
        "supplyName" : "小白菜供应商",
        "restruantId" : id,
        "restruantName" : name,
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "N"
    }
    var offerSheet1 ={
        "name" : "青菜报价单B20150826115027",
        "materials" : [
            {
                "material_id" : "55963df2790907040638d957",
                "material_name" : "青菜",
                "price" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963e11790907040638d959",
                "material_name" : "草头",
                "price" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963e97790907040638d95a",
                "material_name" : "蒜肉",
                "price" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ea6790907040638d95b",
                "material_name" : "老姜",
                "price" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ee6790907040638d95c",
                "material_name" : "毛菜",
                "price" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963efe790907040638d95d",
                "material_name" : "肉葱",
                "price" : "5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f15790907040638d95e",
                "material_name" : "绢豆腐",
                "price" : "3",
                "unit" : "合",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f27790907040638d95f",
                "material_name" : "香菜",
                "price" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f38790907040638d960",
                "material_name" : "荷兰黄瓜",
                "price" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f57790907040638d962",
                "material_name" : "黄瓜苗",
                "price" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f6a790907040638d963",
                "material_name" : "红椒",
                "price" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963fc7790907040638d964",
                "material_name" : "小园子",
                "price" : "10",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963fe0790907040638d965",
                "material_name" : "豆苗",
                "price" : "20",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ff6790907040638d966",
                "material_name" : "青大蒜",
                "price" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "5596400d790907040638d967",
                "material_name" : "茶树菇",
                "price" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f47790907040638d961",
                "material_name" : "球生菜",
                "price" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            }
        ],
        "supply_id" : "55ddcd4aa59a8ff844407ecb",
        "supplyName" : "小白菜供应商",
        "isPublic" : "0",
        "restruantdId" : id,
        "restruantdName" : name,
        "start" : "2",
        "createUserId" : "55dd2d7dca6d8b4c42405c6a",
        "comfirmeUserId" : "55dd2d7dca6d8b4c42405c6a"
    }
    var offerSheet2 ={
        "name" : "猪肉报价单B20150826115528",
        "materials" : [
            {
                "material_id" : "559a28bd2581208123beab29",
                "material_name" : "方肉",
                "price" : "13",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a28cd2581208123beab2a",
                "material_name" : "夹心肉糜",
                "price" : "20",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a29162581208123beab2b",
                "material_name" : "肉丝（员）",
                "price" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a1a2581208123beab2c",
                "material_name" : "纯精肉",
                "price" : "20",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a2d2581208123beab2d",
                "material_name" : "肥牛肉",
                "price" : "50.9",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a3b2581208123beab2e",
                "material_name" : "崇明咸方肉",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a4a2581208123beab2f",
                "material_name" : "肋排",
                "price" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a5b2581208123beab30",
                "material_name" : "猪肝",
                "price" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a682581208123beab31",
                "material_name" : "肥肉丁",
                "price" : "19",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a762581208123beab32",
                "material_name" : "猪占",
                "price" : "24",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a832581208123beab33",
                "material_name" : "双汇猪手",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a9a2581208123beab34",
                "material_name" : "肺头",
                "price" : "16",
                "unit" : "只",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2aa52581208123beab35",
                "material_name" : "肥肉丝",
                "price" : "15",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2ab12581208123beab36",
                "material_name" : "大肠头",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2abe2581208123beab37",
                "material_name" : "肚子",
                "price" : "45",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2acc2581208123beab38",
                "material_name" : "3号肉",
                "price" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            }
        ],
        "supply_id" : "55ddcd4aa59a8ff844407ecb",
        "supplyName" : "小白菜供应商",
        "isPublic" : "0",
        "restruantdId" : id,
        "restruantdName" : name,
        "start" : "2",
        "createUserId" : "55dd2d7dca6d8b4c42405c6a",
        "comfirmeUserId" : "55dd2d7dca6d8b4c42405c6a"
    }
    var inq1 = {
        "name" : "猪肉要货单X20150826",
        "materials" : [
            {
                "material_id" : "559a28bd2581208123beab29",
                "material_name" : "方肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a28cd2581208123beab2a",
                "material_name" : "夹心肉糜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a29162581208123beab2b",
                "material_name" : "肉丝（员）",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a1a2581208123beab2c",
                "material_name" : "纯精肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a2d2581208123beab2d",
                "material_name" : "肥牛肉",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a3b2581208123beab2e",
                "material_name" : "崇明咸方肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a4a2581208123beab2f",
                "material_name" : "肋排",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a5b2581208123beab30",
                "material_name" : "猪肝",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a682581208123beab31",
                "material_name" : "肥肉丁",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a762581208123beab32",
                "material_name" : "猪占",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a832581208123beab33",
                "material_name" : "双汇猪手",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a9a2581208123beab34",
                "material_name" : "肺头",
                "material_unit" : "只",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2aa52581208123beab35",
                "material_name" : "肥肉丝",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2ab12581208123beab36",
                "material_name" : "大肠头",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2abe2581208123beab37",
                "material_name" : "肚子",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2acc2581208123beab38",
                "material_name" : "3号肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            }
        ],
        "restruant_id" : id,
        "restruantName" : name,
        "isPublic" : "0",
        "start" : "1",
        "createUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "supplyId" : '55ddcd4aa59a8ff844407ecb',
        "supplyName" : '小白菜供应商'
    }
    var inq2 = {
        "name" : "蔬菜要货单X20150826",
        "materials" : [
            {
                "material_id" : "55963df2790907040638d957",
                "material_name" : "青菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963e11790907040638d959",
                "material_name" : "草头",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963e97790907040638d95a",
                "material_name" : "蒜肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ea6790907040638d95b",
                "material_name" : "老姜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ee6790907040638d95c",
                "material_name" : "毛菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963efe790907040638d95d",
                "material_name" : "肉葱",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f15790907040638d95e",
                "material_name" : "绢豆腐",
                "material_unit" : "合",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f27790907040638d95f",
                "material_name" : "香菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f38790907040638d960",
                "material_name" : "荷兰黄瓜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f47790907040638d961",
                "material_name" : "球生菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f57790907040638d962",
                "material_name" : "黄瓜苗",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f6a790907040638d963",
                "material_name" : "红椒",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963fc7790907040638d964",
                "material_name" : "小园子",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963fe0790907040638d965",
                "material_name" : "豆苗",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ff6790907040638d966",
                "material_name" : "青大蒜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "5596400d790907040638d967",
                "material_name" : "茶树菇",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            }
        ],
        "restruant_id" : id,
        "restruantName" : name,
        "isPublic" : "0",
        "start" : "1",
        "createUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "supplyId" : '55ddcd4aa59a8ff844407ecb',
        "supplyName" : '小白菜供应商'
    }
    //常用联系人
    var frequentContacts = {
        "mechanism_id" : id,
        "mechanism_type" : "1",
        "contacts" : [
            "55ddcd4aa59a8ff844407ecb"
        ]
    }
    //供应商常用联系人
    var frequentContacts2 = {
        "mechanism_id" : '55ddcd4aa59a8ff844407ecb',
        "mechanism_type" : "2",
        "contacts" : [
            "55ddcd2fa59a8ff844407ebf"
        ]
    }
    var supplyData = {
        _id:new BSON.ObjectID('55ddcd4aa59a8ff844407ecb'),
        name: "小白菜供货商",
        header: "大白菜",
        telephone: "18600000001",
        area: "上海",
        isHead: "1",
        address: "上海市浦东新区",
        isAvab: "true"
    };
    mongodaDao.save(TempleteData1,'Template',function(err,data){});
    mongodaDao.save(templeteData2,'Template',function(err,data){});
    mongodaDao.save(TempleteData3,'Template',function(err,data){});
    mongodaDao.save(templeteData4,'Template',function(err,data){});
    mongodaDao.save(order1,'Orders',function(err,data){});
    mongodaDao.save(order2,'Orders',function(err,data){});
    mongodaDao.save(order3,'Orders',function(err,data){});
    mongodaDao.save(order4,'Orders',function(err,data){});
    mongodaDao.save(order5,'Orders',function(err,data){});
    mongodaDao.save(order6,'Orders',function(err,data){});
    mongodaDao.save(offerSheet1,'OfferSheet',function(err,data){});
    mongodaDao.save(offerSheet2,'OfferSheet',function(err,data){});
    mongodaDao.save(inq1,'InquerySheet',function(err,data){});
    mongodaDao.save(inq1,'InquerySheet',function(err,data){});
    mongodaDao.save(frequentContacts,'FrequentContacts',function(err,data){});
    mongodaDao.save(frequentContacts2,'FrequentContacts',function(err,data){});
    mongodaDao.save(supplyData,'Supply',function(err,data){});
}

exports.initSupplyData = function(id,name){
    var templeteData1 = {
        "name" : "猪肉要货单",
        "materials" : [
            {
                "_id" : "559a28bd2581208123beab29",
                "name" : "方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:33.418Z"
            },
            {
                "_id" : "559a28cd2581208123beab2a",
                "name" : "夹心肉糜",
                "price" : "13.3",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:49.022Z"
            },
            {
                "_id" : "559a29162581208123beab2b",
                "name" : "肉丝（员）",
                "price" : "13",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:07:02.319Z"
            },
            {
                "_id" : "559a2a1a2581208123beab2c",
                "name" : "纯精肉",
                "price" : "15",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:22.374Z"
            },
            {
                "_id" : "559a2a2d2581208123beab2d",
                "name" : "肥牛肉",
                "price" : "7",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-06T07:11:41.816Z"
            },
            {
                "_id" : "559a2a3b2581208123beab2e",
                "name" : "崇明咸方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:55.361Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.695Z"
            },
            {
                "_id" : "559a2a4a2581208123beab2f",
                "name" : "肋排",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:10.462Z"
            },
            {
                "_id" : "559a2a5b2581208123beab30",
                "name" : "猪肝",
                "price" : "12",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:27.082Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.694Z"
            },
            {
                "_id" : "559a2a682581208123beab31",
                "name" : "肥肉丁",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:40.781Z"
            },
            {
                "_id" : "559a2a762581208123beab32",
                "name" : "猪占",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:54.504Z"
            },
            {
                "_id" : "559a2a832581208123beab33",
                "name" : "双汇猪手",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:07.073Z"
            },
            {
                "_id" : "559a2a9a2581208123beab34",
                "name" : "肺头",
                "price" : "5",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "只",
                "createdAt" : "2015-07-06T07:13:30.134Z"
            },
            {
                "_id" : "559a2aa52581208123beab35",
                "name" : "肥肉丝",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:41.269Z"
            },
            {
                "_id" : "559a2ab12581208123beab36",
                "name" : "大肠头",
                "price" : "22",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:53.902Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.691Z"
            },
            {
                "_id" : "559a2abe2581208123beab37",
                "name" : "肚子",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:06.873Z"
            },
            {
                "_id" : "559a2acc2581208123beab38",
                "name" : "3号肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:20.238Z"
            }
        ],
        "type" : "2",
        "mechanism_id" : id
    };
    var templeteData2 = {
        "name" : "蔬菜要货单",
        "materials" : [
            {
                "_id" : "55963df2790907040638d957",
                "name" : "青菜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:46:58.680Z",
                "updatedAt" : "2015-08-10T07:56:19.037Z"
            },
            {
                "_id" : "55963e11790907040638d959",
                "name" : "草头",
                "price" : "7",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:47:29.907Z",
                "updatedAt" : "2015-07-03T08:37:07.451Z"
            },
            {
                "_id" : "55963e97790907040638d95a",
                "name" : "蒜肉",
                "price" : "4.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:43.764Z",
                "updatedAt" : "2015-07-03T08:37:24.777Z"
            },
            {
                "_id" : "55963ea6790907040638d95b",
                "name" : "老姜",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:58.344Z",
                "updatedAt" : "2015-07-03T08:38:25.681Z"
            },
            {
                "_id" : "55963ee6790907040638d95c",
                "name" : "毛菜",
                "price" : "2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:02.833Z",
                "updatedAt" : "2015-07-03T08:38:37.207Z"
            },
            {
                "_id" : "55963efe790907040638d95d",
                "name" : "肉葱",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:26.929Z",
                "updatedAt" : "2015-07-03T08:38:48.619Z"
            },
            {
                "_id" : "55963f15790907040638d95e",
                "name" : "绢豆腐",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "合",
                "createdAt" : "2015-07-03T07:51:49.623Z",
                "updatedAt" : "2015-07-03T08:39:06.262Z"
            },
            {
                "_id" : "55963f27790907040638d95f",
                "name" : "香菜",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:07.593Z",
                "updatedAt" : "2015-07-03T08:39:25.357Z"
            },
            {
                "_id" : "55963f38790907040638d960",
                "name" : "荷兰黄瓜",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:24.824Z",
                "updatedAt" : "2015-07-03T08:39:44.866Z"
            },
            {
                "_id" : "55963f47790907040638d961",
                "name" : "球生菜",
                "price" : "5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:39.578Z",
                "updatedAt" : "2015-07-03T08:39:56.676Z"
            },
            {
                "_id" : "55963f57790907040638d962",
                "name" : "黄瓜苗",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:55.185Z",
                "updatedAt" : "2015-07-03T08:40:11.711Z"
            },
            {
                "_id" : "55963f6a790907040638d963",
                "name" : "红椒",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:53:14.434Z",
                "updatedAt" : "2015-07-03T08:40:20.306Z"
            },
            {
                "_id" : "55963fc7790907040638d964",
                "name" : "小园子",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:54:47.243Z",
                "updatedAt" : "2015-07-03T08:40:39.039Z"
            },
            {
                "_id" : "55963fe0790907040638d965",
                "name" : "豆苗",
                "price" : "5.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:55:12.083Z",
                "updatedAt" : "2015-07-03T08:41:11.448Z"
            },
            {
                "_id" : "55963ff6790907040638d966",
                "name" : "青大蒜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:34.842Z",
                "updatedAt" : "2015-07-03T08:42:44.206Z"
            },
            {
                "_id" : "5596400d790907040638d967",
                "name" : "茶树菇",
                "price" : "9.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:57.294Z",
                "updatedAt" : "2015-07-03T08:42:55.496Z"
            }
        ],
        "type" : "2",
        "mechanism_id" :id
    };
    var order1 = {
        "orderNo" : "E2015082611592478494880",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "18"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "13",
                "paidIn" : "12"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "34",
                "paidIn" : "34"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "5",
                "paidIn" : "5"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "6",
                "paidIn" : "6"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "8",
                "paidIn" : "8"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "12",
                "paidIn" : "12"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "6672.8",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "55dd2d4d02a9354f423d29fc",
        "receiver" : "仓库小冯",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "R"
    };
    var order2={
        "orderNo" : "E2015082612004089504662",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "35",
                "paidIn" : "35"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "10",
                "paidIn" : "10"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "20",
                "paidIn" : "20"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "15",
                "paidIn" : "15"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "25",
                "paidIn" : "25"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "23",
                "paidIn" : "23"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "12",
                "paidIn" : "12"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "23",
                "paidIn" : "23"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "35",
                "paidIn" : "35"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "24",
                "paidIn" : "24"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "13",
                "paidIn" : "13"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "34",
                "paidIn" : "34"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "37",
                "paidIn" : "37"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "30",
                "paidIn" : "30"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "2112.29",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "55dd2d4d02a9354f423d29fc",
        "receiver" : "仓库小冯",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "R"
    };
    var order3 = {
        "orderNo" : "E2015082612090299735191",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "14"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "21"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "18"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "5001.8",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "S"
    };
    var order4 = {
        "orderNo" : "E2015082612105173437465",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "14"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "4"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "6"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "27"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "17"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "1487.4",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "S"
    };
    var order5 = {
        "orderNo" : "E2015082612135711647674",
        "orderName" : "猪肉报价单B20150826115528",
        "orderItem" : [
            {
                "materialId" : "559a28bd2581208123beab29",
                "materialName" : "方肉",
                "materialPrice" : "13",
                "unit" : "斤",
                "remark" : "",
                "number" : "25"
            },
            {
                "materialId" : "559a28cd2581208123beab2a",
                "materialName" : "夹心肉糜",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "559a29162581208123beab2b",
                "materialName" : "肉丝（员）",
                "materialPrice" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "559a2a1a2581208123beab2c",
                "materialName" : "纯精肉",
                "materialPrice" : "20",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "559a2a2d2581208123beab2d",
                "materialName" : "肥牛肉",
                "materialPrice" : "50.9",
                "unit" : "包",
                "remark" : "",
                "number" : "4"
            },
            {
                "materialId" : "559a2a3b2581208123beab2e",
                "materialName" : "崇明咸方肉",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "559a2a4a2581208123beab2f",
                "materialName" : "肋排",
                "materialPrice" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a5b2581208123beab30",
                "materialName" : "猪肝",
                "materialPrice" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "number" : "11"
            },
            {
                "materialId" : "559a2a682581208123beab31",
                "materialName" : "肥肉丁",
                "materialPrice" : "19",
                "unit" : "斤",
                "remark" : "",
                "number" : "21"
            },
            {
                "materialId" : "559a2a762581208123beab32",
                "materialName" : "猪占",
                "materialPrice" : "24",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "559a2a832581208123beab33",
                "materialName" : "双汇猪手",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "24"
            },
            {
                "materialId" : "559a2a9a2581208123beab34",
                "materialName" : "肺头",
                "materialPrice" : "16",
                "unit" : "只",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2aa52581208123beab35",
                "materialName" : "肥肉丝",
                "materialPrice" : "15",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "559a2ab12581208123beab36",
                "materialName" : "大肠头",
                "materialPrice" : "30",
                "unit" : "斤",
                "remark" : "",
                "number" : "34"
            },
            {
                "materialId" : "559a2abe2581208123beab37",
                "materialName" : "肚子",
                "materialPrice" : "45",
                "unit" : "斤",
                "remark" : "",
                "number" : "17"
            },
            {
                "materialId" : "559a2acc2581208123beab38",
                "materialName" : "3号肉",
                "materialPrice" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "5"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "6145.1",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "N"
    };
    var order6 = {
        "orderNo" : "E2015082612150271323653",
        "orderName" : "青菜报价单B20150826115027",
        "orderItem" : [
            {
                "materialId" : "55963df2790907040638d957",
                "materialName" : "青菜",
                "materialPrice" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "number" : "20"
            },
            {
                "materialId" : "55963e11790907040638d959",
                "materialName" : "草头",
                "materialPrice" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963e97790907040638d95a",
                "materialName" : "蒜肉",
                "materialPrice" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "number" : "7"
            },
            {
                "materialId" : "55963ea6790907040638d95b",
                "materialName" : "老姜",
                "materialPrice" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963ee6790907040638d95c",
                "materialName" : "毛菜",
                "materialPrice" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "15"
            },
            {
                "materialId" : "55963efe790907040638d95d",
                "materialName" : "肉葱",
                "materialPrice" : "5",
                "unit" : "斤",
                "remark" : "",
                "number" : "13"
            },
            {
                "materialId" : "55963f15790907040638d95e",
                "materialName" : "绢豆腐",
                "materialPrice" : "3",
                "unit" : "合",
                "remark" : "",
                "number" : "24"
            },
            {
                "materialId" : "55963f27790907040638d95f",
                "materialName" : "香菜",
                "materialPrice" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            },
            {
                "materialId" : "55963f38790907040638d960",
                "materialName" : "荷兰黄瓜",
                "materialPrice" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            },
            {
                "materialId" : "55963f57790907040638d962",
                "materialName" : "黄瓜苗",
                "materialPrice" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "23"
            },
            {
                "materialId" : "55963f6a790907040638d963",
                "materialName" : "红椒",
                "materialPrice" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963fc7790907040638d964",
                "materialName" : "小园子",
                "materialPrice" : "10",
                "unit" : "包",
                "remark" : "",
                "number" : "5"
            },
            {
                "materialId" : "55963fe0790907040638d965",
                "materialName" : "豆苗",
                "materialPrice" : "20",
                "unit" : "包",
                "remark" : "",
                "number" : "8"
            },
            {
                "materialId" : "55963ff6790907040638d966",
                "materialName" : "青大蒜",
                "materialPrice" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "number" : "9"
            },
            {
                "materialId" : "5596400d790907040638d967",
                "materialName" : "茶树菇",
                "materialPrice" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "number" : "12"
            },
            {
                "materialId" : "55963f47790907040638d961",
                "materialName" : "球生菜",
                "materialPrice" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "number" : "10"
            }
        ],
        "offerSheetId" : "",
        "toSupply" : id,
        "sum" : "1039.14",
        "supplyName" : name,
        "restruantId" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "mobile" : "15999999999",
        "receiverId" : "",
        "receiver" : "李先生",
        "receiverAddress" : "上海市普陀区曹杨路666号",
        "createById" : "55dd2d4d02a9354f423d29fc",
        "createBy" : "17091757969",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserName" : "17091757969",
        "orderStatus" : "N"
    };
    var offerSheet1 ={

        "name" : "青菜报价单B20150826115027",
        "materials" : [
            {
                "material_id" : "55963df2790907040638d957",
                "material_name" : "青菜",
                "price" : "3.2",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963e11790907040638d959",
                "material_name" : "草头",
                "price" : "2.3",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963e97790907040638d95a",
                "material_name" : "蒜肉",
                "price" : "7.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ea6790907040638d95b",
                "material_name" : "老姜",
                "price" : "4.76",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ee6790907040638d95c",
                "material_name" : "毛菜",
                "price" : "4.89",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963efe790907040638d95d",
                "material_name" : "肉葱",
                "price" : "5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f15790907040638d95e",
                "material_name" : "绢豆腐",
                "price" : "3",
                "unit" : "合",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f27790907040638d95f",
                "material_name" : "香菜",
                "price" : "2.45",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f38790907040638d960",
                "material_name" : "荷兰黄瓜",
                "price" : "6.78",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f57790907040638d962",
                "material_name" : "黄瓜苗",
                "price" : "4.67",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f6a790907040638d963",
                "material_name" : "红椒",
                "price" : "3.67",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963fc7790907040638d964",
                "material_name" : "小园子",
                "price" : "10",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963fe0790907040638d965",
                "material_name" : "豆苗",
                "price" : "20",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963ff6790907040638d966",
                "material_name" : "青大蒜",
                "price" : "2.89",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "5596400d790907040638d967",
                "material_name" : "茶树菇",
                "price" : "8.78",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "55963f47790907040638d961",
                "material_name" : "球生菜",
                "price" : "5.34",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            }
        ],
        "supply_id" : id,
        "supplyName" : name,
        "isPublic" : "0",
        "restruantdId" : "55ddcd2fa59a8ff844407ebf",
        "restruantdName" : "大白菜餐厅",
        "start" : "2",
        "createUserId" : "55dd2d7dca6d8b4c42405c6a",
        "comfirmeUserId" : "55dd2d7dca6d8b4c42405c6a"
    }
    var offerSheet2 = {
        "name" : "猪肉报价单B20150826115528",
        "materials" : [
            {
                "material_id" : "559a28bd2581208123beab29",
                "material_name" : "方肉",
                "price" : "13",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a28cd2581208123beab2a",
                "material_name" : "夹心肉糜",
                "price" : "20",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a29162581208123beab2b",
                "material_name" : "肉丝（员）",
                "price" : "18.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a1a2581208123beab2c",
                "material_name" : "纯精肉",
                "price" : "20",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a2d2581208123beab2d",
                "material_name" : "肥牛肉",
                "price" : "50.9",
                "unit" : "包",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a3b2581208123beab2e",
                "material_name" : "崇明咸方肉",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a4a2581208123beab2f",
                "material_name" : "肋排",
                "price" : "25.5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a5b2581208123beab30",
                "material_name" : "猪肝",
                "price" : "20.5",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a682581208123beab31",
                "material_name" : "肥肉丁",
                "price" : "19",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a762581208123beab32",
                "material_name" : "猪占",
                "price" : "24",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a832581208123beab33",
                "material_name" : "双汇猪手",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2a9a2581208123beab34",
                "material_name" : "肺头",
                "price" : "16",
                "unit" : "只",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2aa52581208123beab35",
                "material_name" : "肥肉丝",
                "price" : "15",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2ab12581208123beab36",
                "material_name" : "大肠头",
                "price" : "30",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2abe2581208123beab37",
                "material_name" : "肚子",
                "price" : "45",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            },
            {
                "material_id" : "559a2acc2581208123beab38",
                "material_name" : "3号肉",
                "price" : "35.6",
                "unit" : "斤",
                "remark" : "",
                "isOffer" : "1"
            }
        ],
        "supply_id" : id,
        "supplyName" : name,
        "isPublic" : "0",
        "restruantdId" : "55ddcd2fa59a8ff844407ebf",
        "restruantdName" : "大白菜餐厅",
        "start" : "2",
        "createUserId" : "55dd2d7dca6d8b4c42405c6a",
        "comfirmeUserId" : "55dd2d7dca6d8b4c42405c6a"
    }
    var inq1 = {
        "name" : "猪肉要货单X20150826",
        "materials" : [
            {
                "material_id" : "559a28bd2581208123beab29",
                "material_name" : "方肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a28cd2581208123beab2a",
                "material_name" : "夹心肉糜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a29162581208123beab2b",
                "material_name" : "肉丝（员）",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a1a2581208123beab2c",
                "material_name" : "纯精肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a2d2581208123beab2d",
                "material_name" : "肥牛肉",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a3b2581208123beab2e",
                "material_name" : "崇明咸方肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a4a2581208123beab2f",
                "material_name" : "肋排",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a5b2581208123beab30",
                "material_name" : "猪肝",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a682581208123beab31",
                "material_name" : "肥肉丁",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a762581208123beab32",
                "material_name" : "猪占",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a832581208123beab33",
                "material_name" : "双汇猪手",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2a9a2581208123beab34",
                "material_name" : "肺头",
                "material_unit" : "只",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2aa52581208123beab35",
                "material_name" : "肥肉丝",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2ab12581208123beab36",
                "material_name" : "大肠头",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2abe2581208123beab37",
                "material_name" : "肚子",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "559a2acc2581208123beab38",
                "material_name" : "3号肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            }
        ],
        "restruant_id" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "isPublic" : "0",
        "start" : "1",
        "createUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "supplyId" : id,
        "supplyName" : name
    }
    var inq2 = {
        "name" : "蔬菜要货单X20150826",
        "materials" : [
            {
                "material_id" : "55963df2790907040638d957",
                "material_name" : "青菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963e11790907040638d959",
                "material_name" : "草头",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963e97790907040638d95a",
                "material_name" : "蒜肉",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ea6790907040638d95b",
                "material_name" : "老姜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ee6790907040638d95c",
                "material_name" : "毛菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963efe790907040638d95d",
                "material_name" : "肉葱",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f15790907040638d95e",
                "material_name" : "绢豆腐",
                "material_unit" : "合",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f27790907040638d95f",
                "material_name" : "香菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f38790907040638d960",
                "material_name" : "荷兰黄瓜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f47790907040638d961",
                "material_name" : "球生菜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f57790907040638d962",
                "material_name" : "黄瓜苗",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963f6a790907040638d963",
                "material_name" : "红椒",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963fc7790907040638d964",
                "material_name" : "小园子",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963fe0790907040638d965",
                "material_name" : "豆苗",
                "material_unit" : "包",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "55963ff6790907040638d966",
                "material_name" : "青大蒜",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            },
            {
                "material_id" : "5596400d790907040638d967",
                "material_name" : "茶树菇",
                "material_unit" : "斤",
                "material_remark" : "",
                "isInquery" : "1"
            }
        ],
        "restruant_id" : "55ddcd2fa59a8ff844407ebf",
        "restruantName" : "大白菜餐厅",
        "isPublic" : "0",
        "start" : "1",
        "createUserId" : "55dd2d4d02a9354f423d29fc",
        "comfirmeUserId" : "55dd2d4d02a9354f423d29fc",
        "supplyId" : id,
        "supplyName" : name
    }
    //常用联系人
     var frequentContacts = {
        "mechanism_id" : id,
        "mechanism_type" : "2",
        "contacts" : [
        "55ddcd2fa59a8ff844407ebf"
    ]
    }
    //餐厅常用联系人
    var frequentContacts2 = {
        "mechanism_id" : '55ddcd2fa59a8ff844407ebf',
        "mechanism_type" : "1",
        "contacts" : [
            "55ddcd4aa59a8ff844407ecb"
        ]
    }
    var resturantData = {
        _id:new BSON.ObjectID('55ddcd2fa59a8ff844407ebf'),
        name: "大白菜餐厅",
        header: "大白菜",
        telephone: "18600000000",
        area: "上海",
        address: "上海市浦东新区",
        isHead: "1",
        isAvab: "true"
    };
    //初始化游客供应商模版数据
    var TempleteData3 = {
        "name" : "猪肉要货单",
        "materials" : [
            {
                "_id" : "559a28bd2581208123beab29",
                "name" : "方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:33.418Z"
            },
            {
                "_id" : "559a28cd2581208123beab2a",
                "name" : "夹心肉糜",
                "price" : "13.3",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:05:49.022Z"
            },
            {
                "_id" : "559a29162581208123beab2b",
                "name" : "肉丝（员）",
                "price" : "13",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:07:02.319Z"
            },
            {
                "_id" : "559a2a1a2581208123beab2c",
                "name" : "纯精肉",
                "price" : "15",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:22.374Z"
            },
            {
                "_id" : "559a2a2d2581208123beab2d",
                "name" : "肥牛肉",
                "price" : "7",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-06T07:11:41.816Z"
            },
            {
                "_id" : "559a2a3b2581208123beab2e",
                "name" : "崇明咸方肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:11:55.361Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.695Z"
            },
            {
                "_id" : "559a2a4a2581208123beab2f",
                "name" : "肋排",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:10.462Z"
            },
            {
                "_id" : "559a2a5b2581208123beab30",
                "name" : "猪肝",
                "price" : "12",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:27.082Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.694Z"
            },
            {
                "_id" : "559a2a682581208123beab31",
                "name" : "肥肉丁",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:40.781Z"
            },
            {
                "_id" : "559a2a762581208123beab32",
                "name" : "猪占",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:12:54.504Z"
            },
            {
                "_id" : "559a2a832581208123beab33",
                "name" : "双汇猪手",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:07.073Z"
            },
            {
                "_id" : "559a2a9a2581208123beab34",
                "name" : "肺头",
                "price" : "5",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "只",
                "createdAt" : "2015-07-06T07:13:30.134Z"
            },
            {
                "_id" : "559a2aa52581208123beab35",
                "name" : "肥肉丝",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:41.269Z"
            },
            {
                "_id" : "559a2ab12581208123beab36",
                "name" : "大肠头",
                "price" : "22",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:13:53.902Z",
                "restaurantNum" : 1,
                "restaurantIds" : [
                    "55b237007476334b3243478f"
                ],
                "updatedAt" : "2015-07-25T03:43:59.691Z"
            },
            {
                "_id" : "559a2abe2581208123beab37",
                "name" : "肚子",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:06.873Z"
            },
            {
                "_id" : "559a2acc2581208123beab38",
                "name" : "3号肉",
                "price" : "0",
                "categoryId" : "55963887f12dd78a9be732e1",
                "categoryName" : "肉类",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-06T07:14:20.238Z"
            }
        ],
        "type" : "1",
        "mechanism_id" : '55ddcd2fa59a8ff844407ebf'
    };
    //小白菜供应商数据
    var templeteData4 = {
        "name" : "蔬菜要货单",
        "materials" : [
            {
                "_id" : "55963df2790907040638d957",
                "name" : "青菜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:46:58.680Z",
                "updatedAt" : "2015-08-10T07:56:19.037Z"
            },
            {
                "_id" : "55963e11790907040638d959",
                "name" : "草头",
                "price" : "7",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:47:29.907Z",
                "updatedAt" : "2015-07-03T08:37:07.451Z"
            },
            {
                "_id" : "55963e97790907040638d95a",
                "name" : "蒜肉",
                "price" : "4.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:43.764Z",
                "updatedAt" : "2015-07-03T08:37:24.777Z"
            },
            {
                "_id" : "55963ea6790907040638d95b",
                "name" : "老姜",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:49:58.344Z",
                "updatedAt" : "2015-07-03T08:38:25.681Z"
            },
            {
                "_id" : "55963ee6790907040638d95c",
                "name" : "毛菜",
                "price" : "2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:02.833Z",
                "updatedAt" : "2015-07-03T08:38:37.207Z"
            },
            {
                "_id" : "55963efe790907040638d95d",
                "name" : "肉葱",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:51:26.929Z",
                "updatedAt" : "2015-07-03T08:38:48.619Z"
            },
            {
                "_id" : "55963f15790907040638d95e",
                "name" : "绢豆腐",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "合",
                "createdAt" : "2015-07-03T07:51:49.623Z",
                "updatedAt" : "2015-07-03T08:39:06.262Z"
            },
            {
                "_id" : "55963f27790907040638d95f",
                "name" : "香菜",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:07.593Z",
                "updatedAt" : "2015-07-03T08:39:25.357Z"
            },
            {
                "_id" : "55963f38790907040638d960",
                "name" : "荷兰黄瓜",
                "price" : "3.2",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:24.824Z",
                "updatedAt" : "2015-07-03T08:39:44.866Z"
            },
            {
                "_id" : "55963f47790907040638d961",
                "name" : "球生菜",
                "price" : "5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:39.578Z",
                "updatedAt" : "2015-07-03T08:39:56.676Z"
            },
            {
                "_id" : "55963f57790907040638d962",
                "name" : "黄瓜苗",
                "price" : "10",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:52:55.185Z",
                "updatedAt" : "2015-07-03T08:40:11.711Z"
            },
            {
                "_id" : "55963f6a790907040638d963",
                "name" : "红椒",
                "price" : "6.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:53:14.434Z",
                "updatedAt" : "2015-07-03T08:40:20.306Z"
            },
            {
                "_id" : "55963fc7790907040638d964",
                "name" : "小园子",
                "price" : "4",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:54:47.243Z",
                "updatedAt" : "2015-07-03T08:40:39.039Z"
            },
            {
                "_id" : "55963fe0790907040638d965",
                "name" : "豆苗",
                "price" : "5.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "包",
                "createdAt" : "2015-07-03T07:55:12.083Z",
                "updatedAt" : "2015-07-03T08:41:11.448Z"
            },
            {
                "_id" : "55963ff6790907040638d966",
                "name" : "青大蒜",
                "price" : "3.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:34.842Z",
                "updatedAt" : "2015-07-03T08:42:44.206Z"
            },
            {
                "_id" : "5596400d790907040638d967",
                "name" : "茶树菇",
                "price" : "9.5",
                "categoryId" : "55963857f12dd78a9be732de",
                "categoryName" : "蔬菜",
                "remark" : "",
                "unit" : "斤",
                "createdAt" : "2015-07-03T07:55:57.294Z",
                "updatedAt" : "2015-07-03T08:42:55.496Z"
            }
        ],
        "type" : "1",
        "mechanism_id" :'55ddcd2fa59a8ff844407ebf'
    };
    mongodaDao.save(templeteData1,'Template',function(err,data){});
    mongodaDao.save(templeteData2,'Template',function(err,data){});
    mongodaDao.save(templeteData3,'Template',function(err,data){});
    mongodaDao.save(templeteData4,'Template',function(err,data){});
    mongodaDao.save(order1,'Orders',function(err,data){});
    mongodaDao.save(order2,'Orders',function(err,data){});
    mongodaDao.save(order3,'Orders',function(err,data){});
    mongodaDao.save(order4,'Orders',function(err,data){});
    mongodaDao.save(order5,'Orders',function(err,data){});
    mongodaDao.save(order6,'Orders',function(err,data){});
    mongodaDao.save(offerSheet1,'OfferSheet',function(err,data){});
    mongodaDao.save(offerSheet2,'OfferSheet',function(err,data){});
    mongodaDao.save(inq1,'InquerySheet',function(err,data){});
    mongodaDao.save(inq2,'InquerySheet',function(err,data){});
    mongodaDao.save(frequentContacts,'FrequentContacts',function(err,data){});
    mongodaDao.save(frequentContacts2,'FrequentContacts',function(err,data){});
    mongodaDao.save(resturantData,'Restruant',function(err,data){});
}