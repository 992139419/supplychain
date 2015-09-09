/**
 * Created by Hades on 15/6/26.
 */

var mongodbDao = require('./mongodbDao');
var BSON = require('mongodb').BSONPure;


var old = {_id: new BSON.ObjectID("558bdf6d7656a16c03312fa3"), 'orderItem.materialId': "558bdf6d7656a16c03312fa3"};
var newData = {'orderItem.$.paidIn': '11'};
mongodbDao.update(old, newData, 'Orders', function (err, data) {
    if (err) {
        console.info(err);
    } else {
        console.info(data);
    }
});
