/**
 * Created by Hades on 15/3/19.
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var config = require('../../config');
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var underscore = require('underscore');
var _db = null;
var Q = require('q');

var hdlBase = function (host, port) {
    if (!!_db) {
        return;
    } else {
        this.db = new Db(config.dbname, new Server(host, port, {
                auto_reconnect: true
            },
            {safe: true}));
        this.db.open(function (err, db) {
            if (err) {
                console.log('====== hdlBase - err ======', err);
            } else {
                _db = db;
            }
        });
    }
};

/**
 * 保存部分
 *
 */
hdlBase.prototype.save = function (data, name, callback) {
    var self = this;
    if (!!data && !!data.length) {
        var _len = data.length;
        for (var i = 0; i < _len; i++) {
            data[i].createdAt = new Date();
        }
    } else {
        data['createdAt'] = new Date();
    }
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        collection.insert(data, {w: 1}, callback);
    });
};

hdlBase.prototype.insertOne = function (data, name, callback) {
    var self = this;
    data['createdAt'] = new Date();
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        collection.insert(data, {w: 1}, callback);
    });
};

hdlBase.prototype.uniqueSave = function (data, name, callback) {
    var self = this;
    var collection = _db.collection(name).findOne(data, function (err, rtn) {
        if (!err && !rtn) {
            self.insertOne(data, name, callback);
        } else {
            callback(new Error('The object exists already.'))
        }
    });
};

hdlBase.prototype.incrementFields = function (criteria, newData, incrementObj, name, callback) {
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        collection.findOne(criteria, function (err, rtn) {
            if (!err && !rtn) {
                callback(new Error('Cannot update an object not existing.'))
            } else {
                newData['updatedAt'] = new Date();
                // Update the document with an atomic operator
                collection.update(criteria, {$set: newData, $inc: incrementObj}, {
                    w: 1,
                    upsert: false,
                    safe: true
                }, callback);
            }
        })
    });
};

/**
 * 查询部分
 *
 */
hdlBase.prototype.queryBy = function (selector, collection, callback) {
    if (!collection) {
        collection = '';
    }
    _db.collection(collection).find(selector).sort({createdAt: -1}).toArray(callback);
};

hdlBase.prototype.queryAdv = function (collection, selector, projection, sort, callback) {
    if (!collection) {
        collection = '';
    }
    _db.collection(collection).find(selector, projection).sort(sort).toArray(callback);
};

hdlBase.prototype.findOne = function (selector, name, callback) {
    _db.collection(name, function (err, collection) {
        collection.findOne(selector, function (err, rtn) {
            if (!!err) {
                callback(err)
            } else {
                callback(null, rtn);
            }
        })
    });
};

hdlBase.prototype.findBySlice = function (selector, collection, start, end, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            db.find(selector).sort({
                _id: -1
            }).skip(start).limit(end - start).toArray(function (err, data) {
                if (err) callback(err);
                else callback(null, data);
            });
        }
    });
};

hdlBase.prototype.findBySortSlice = function (selector, sort, collection, start, end, callback) {
    var self = this;
    _db.collection(collection, function (err, db) {
        if (err) callback(err);
        else {
            var cursor = db.find(selector).skip(start).limit(end - start).sort(sort);
            cursor.toArray(function (err, data) {
                if (err) callback(err);
                else callback(null, data);
            });
        }
    });
};

hdlBase.prototype.findBySort = function (selector, sort, collection, limit, callback) {
    this.findBySortSlice(selector, sort, collection, 0, limit, callback);
};

hdlBase.prototype.findBy = function (selector, collection, limit, callback) {
    this.findBySort(selector, {
            _id: -1
        },
        collection, limit, callback);
};

hdlBase.prototype.findAll = function (collection, limit, callback) {

    var self = this;
    _db.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            db.find().limit(limit).sort({
                _id: -1
            }).toArray(function (err, data) {

                if (err) callback(err);
                else callback(null, data);
            });
        }
    });
};

hdlBase.prototype.pagingQuery = function (selector, collection, sort, start, end, callback) {
    if (!collection) {
        collection = '';
    }
    _db.collection(collection).find(selector).sort(sort).skip(start).limit(end - start).toArray(callback);
};

hdlBase.prototype.getCount = function (criteria, collection, callback) {
    _db.collection(collection, function (err, db) {
        if (err) callback(err);
        else {
            var cursor = db.find(criteria);
            cursor.count(function (err, count) {
                if (err) callback(err);
                else callback(null, count);
            });
        }
    });
};

hdlBase.prototype.findOne = function (source, collection, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            db.findOne(source, function (err, data) {
                if (err) callback(err);
                else callback(null, data);
            });
        }
    });
};

hdlBase.prototype._getIdSource = function (id) {
    var search = {};
    if (id.length === 24) {
        search = {
            _id: ObjectID.createFromHexString(id.toString())
        };
    } else if ((/^[0-9]*$/).test(id) && id.toString().length < 24) {
        search = {
            id: parseInt(id, 10)
        };
    } else if (typeof id === 'object') {
        search = {
            _id: ObjectID.createFromHexString(id.toString())
        };
    } else {
        search = {
            pageurl: id
        };
    }
    return search;
};


hdlBase.prototype.findById = function (id, collection, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            var search = self._getIdSource(id);
            db.findOne(search, function (err, data) {
                if (err) callback(err);
                else {
                    if (data) callback(null, data);
                    else callback('找不到相关数据');
                }
            });
        }
    });
};


hdlBase.prototype.distinctQuery = function (selector,field, collection, callback) {
    if (!collection) {
        collection = '';
    }
    _db.collection(collection).distinct(field,selector,callback);
};

/**
 * 更新部分
 *
 */
hdlBase.prototype.update = function (criteria, newData, name, callback) {
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        collection.findOne(criteria, function (err, rtn) {
            if (!err && !rtn) {
                new Error('Cannot update an object not existing.')
            } else {
                newData['updatedAt'] = new Date();
                // Update the document with an atomic operator
                    collection.update(criteria, {$set: newData}, {w: 1, upsert: true}, callback);
            }
        })
    });
};

hdlBase.prototype.updateOrSave = function (criteria, newData, name, callback) {
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        newData['updatedAt'] = new Date();
        collection.update(criteria, {$set: newData}, {w: 1, upsert: true}, callback);
    });
};

hdlBase.prototype.updateBatch = function (criteria, newData, name, callback) {
    _db.collection(name, function (err, collection) {
        collection.update(criteria, {$set: newData}, {w: 1, multi: true, upsert: true}, callback);
    });
};

hdlBase.prototype.updateById = function (id, data, collection, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            var source = self._getIdSource(id);
            db.update(source, data, {
                    safe: true
                },
                function (err, data) {
                    if (err) callback(err);
                    else callback(null, data);
                });
        }
    });
};

hdlBase.prototype.updateNotset = function (criteria, newData, name, callback) {
    _db.collection(name, function (err, collection) {
        // Insert a document, then update it
        collection.findOne(criteria, function (err, rtn) {
            if (!err && !rtn) {
                new Error('Cannot update an object not existing.')
            } else {
                newData['$set'] = {"updatedAt":new Date()};
                // Update the document with an atomic operator
                collection.update(criteria, newData, {w: 1, upsert: true}, callback);
            }
        })
    });
};
/**
 * 删除部分
 *
 */
hdlBase.prototype.remove = function (data, name, callback) {
    _db.collection(name).remove(data, {w: 1}, callback);
};


hdlBase.prototype.removeById = function (id, collection, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            db.remove({
                    _id: ObjectID.createFromHexString(id)
                },
                {
                    safe: true
                },
                function (err, numberOfRemovedDocs) {
                    if (err) callback(err);
                    else callback(null, numberOfRemovedDocs);
                });
        }
    });
};

hdlBase.prototype.removeBy = function (source, collection, callback) {
    var self = this;
    this.getCollection(collection, function (err, db) {
        if (err) callback(err);
        else {
            db.remove(source, {
                    safe: true
                },
                function (err, numberOfRemovedDocs) {
                    if (err) callback(err);
                    else callback(null, numberOfRemovedDocs);
                });
        }
    });
};

hdlBase.prototype.getCollection = function (collection, callback) {
    this.db.collection(collection, function (err, db) {
        if (err) callback(err);
        else callback(null, db);
    });
};


/**
 * Promise部分，针对Q的简单封装
 *
 */
hdlBase.prototype.pagingQueryPromise = function (data, className, start, num) {
    return Q.nfcall(this.pagingQuery, data, className, {createdAt: -1}, start, start + num);
};

hdlBase.prototype.classQueryPromise = function (data, className) {
    return Q.nfcall(this.queryBy, data, className);
};

hdlBase.prototype.countQueryPromise = function (data, className) {
    return Q.nfcall(this.getCount, data, className);
};

hdlBase.prototype.classSavePromise = function (data, className) {
    return Q.nfcall(this.save, data, className);
}

hdlBase.prototype.classRemovePromise = function (data, className) {
    return Q.nfcall(this.remove, data, className);
}

hdlBase.prototype.classUpdatePromise = function (oldData, newData, className) {
    return Q.nfcall(this.update, oldData, newData, className);
}

module.exports = new hdlBase(config.dbhost, config.dbport);

