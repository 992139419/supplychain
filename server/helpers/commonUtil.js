/**
 * Created by Hades on 14/10/10.
 */

var logger = require('../log/logFactory').getLogger();
var config = require('../../config');
var redisDao = require('../storage/redisDao');
var Q = require('q');


exports.eachVotePct = function (array) {
    if (!array) {
        return;
    }
    var _len = array.length, _temp, _vote, _pct = 0, _sumVotes = 0;
    for (var i = 0; i < _len; i++) {
        _temp = array[i];
        _sumVotes += parseInt(_temp.vote);
    }
    for (var j = 0; j < _len; j++) {
        _temp = array[j];
        _vote = parseInt(_temp.vote);
        if (_sumVotes > 0) {
            _pct = _vote / _sumVotes * 100;
        }
        _temp.percent = _pct;
    }
    return array;
}

/** 转换金额 */
exports.getFormattedAmount = function (amount, currency) {
    if (isBlank(amount)) {
        return;
    }
    if (isBlank(currency)) currency = '';
    switch (currency) {
        case 'CNY':
            amount = formatAmount(amount, 2);
            amount = '人民币 ¥' + amount;
            break;
        case 'USD':
            amount = formatAmount(amount, 2);
            amount = 'USD $' + amount;
            break;
    }
    return amount;
}

exports.getFormattedAmount2 = function (amount, currency) {
    if (isBlank(amount)) {
        return;
    }
    if (isBlank(currency)) currency = '';
    switch (currency) {
        case 'CNY':
            amount = formatAmount(amount, 2);
            amount = '<span style="font-size: 8px">人民币</span> ¥' + amount;
            break;
        case 'USD':
            amount = formatAmount(amount, 2);
            amount = '<span style="font-size: 8px">USD</span> $' + amount;
            break;
    }
    return amount;
}

/** 格式化金额 */
var formatAmount = function (s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
}

/** 还原金额的数字形式 */
var revertAmount = function (s) {
    return parseFloat(s.replace(/[^\d\.-]/g, ""));
}

var getPastDay = function (createDate) {
    if (!createDate) {
        return "";
    }
    var s = createDate.getTime();
    var ns = new Date().getTime();
    var between = ns - s;
    if (between < 3600000) {
        var nowString = parseInt(between / (60 * 1000));
        if (nowString == 0) {
            return "现在";
        } else {
            return parseInt(between / (60 * 1000)) + "分钟以前";
        }
    } else if (3600000 <= between && between < 86400000) {
        // 1小时 ~ 24 小时
        return parseInt(between / 3600000) + "小时以前";
    } else if (86400000 <= between && between < 15811200000) {
        // 一天 ~ 183天(半年)
        return formatDate(createDate, "M-d h:m");
    } else {
        // 大于半年
        return formatDate(createDate, "yyyy-M-d");
    }
}

var getFutureDay = function (end) {
    if (!end) {
        return "";
    }
    var today = new Date();
    var s = today.getTime();
    var ns = end.getTime();
    var between = ns - s;
    if (between < 3600000) {
        var nowString = parseInt(between / (60 * 1000));
        if (nowString <= 0) {
            return "已经结束";
        } else {
            return "还剩" + parseInt(between / (60 * 1000)) + "分钟";
        }
    } else if ((3600000 <= between) && (between < 86400000)) {
        return "还剩" + parseInt(between / 3600000) + "小时";
    } else {
        return "还剩" + parseInt(between / 86400000) + "天";
    }

}

var formatDate = function (input, format) {
    if (!input || !format) {
        return '';
    }
    var date = {
        "M+": input.getMonth() + 1,
        "d+": input.getDate(),
        "h+": input.getHours(),
        "m+": input.getMinutes(),
        "s+": input.getSeconds(),
        "q+": Math.floor((input.getMonth() + 3) / 3),
        "S+": input.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (input.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}

/**
 * @param flag
 * if flag equals 'f', the text "已经结束" is returned
 */
exports.getFormattedDate = function (date, flag) {
    if (!date) {
        return '';
    } else if (date.constructor == String) {
        date = new Date(date);
    }
    var now = new Date();
    try {
        if (now.getTime() < date.getTime()) {
            return getFutureDay(date);
        } else if (!!flag && flag.toLowerCase() == 'f') {
            return '已经结束';
        } else {
            return getPastDay(date);
        }
    } catch (ex) {
        console.error(ex);
        return date;
    }
}
exports.formatDate = formatDate;

// 012345678901234567890123
// 2014-10-22T14:40:42.341Z
exports.parseDateStr = function (inStr) {
    if (!inStr || inStr.length < 16) {
        return inStr;
    }
    var yy = inStr.substring(0, 4);
    var MM = inStr.substring(5, 7);
    MM -= 1;
    var dd = inStr.substring(8, 10);
    var hh = inStr.substring(11, 13);
    var mi = inStr.substring(14, 16);
    var ss = inStr.substring(17, 19);
    var mm = inStr.substring(20, 23);

    var rtn = new Date();
    rtn.setYear(yy);
    rtn.setMonth(MM);
    rtn.setDate(dd);
    rtn.setHours(hh);
    rtn.setMinutes(mi);
    rtn.setSeconds(ss);
    rtn.setMilliseconds(mm);

    return rtn;
};

/*
 This function adds property accessor methods for a property with
 the specified name to the object o.  The methods are named get<name>
 and set<name>.  If a predicate function is supplied, the setter
 method uses it to test its argument for validity before storing it.
 If the predicate returns false, the setter method throws an exception.

 The unusual thing about this function is that the property value
 that is manipulated by the getter and setter methods is not stored in
 the object o.  Instead, the value is stored only in a local variable
 in this function.  The getter and setter methods are also defined
 locally to this function and therefore have access to this local variable.
 Note that the value is private to the two accessor methods, and it cannot
 be set or modified except through the setter.
 */
exports.makeProperty = function (o, name, predicate) {
    var value;  // This is the property value

    // The setter method simply returns the value.
    o["get" + name] = function () {
        return value;
    };

    // The getter method stores the value or throws an exception if
    // the predicate rejects the value.
    o["set" + name] = function (v) {
        if (predicate && !predicate(v))
            throw "set" + name + ": invalid value " + v;
        else
            value = v;
    };
};

exports.extractHtmlImg = function (str) {
    var rtn = [];
    if(str){
        return rtn;
    }
    var regex = /<img[^<]+[(\/>)$]/g;
    var _imgArr = str.match(regex);
    if(!_imgArr || _imgArr.length<1){
        return rtn;
    }
    var _srcArr = [], i = 0, _len = _imgArr.length, _elem, _subArr, _src;
    var regex2 = /src="[^"]+"/i
    for(; i<_len; i++){
        _elem = _imgArr[i];
        _subArr = _elem.match(regex2);
        if(!_subArr || _subArr.length<1){
            continue;
        }
        _src = _subArr[0].substring(5, _subArr[0].length-1); // 'src="'.length == 5
        rtn.push({imgSrc: _src, imgAlt: ''});
    }
    return rtn;
}

exports.convertContentType = function (suffix) {
    if (hdlUtil.trimStr(suffix) == '') {
        suffix = '';
    }
    suffix = suffix.toLowerCase();
    var contentType = '';
    switch (suffix) {
        case 'png':
            contentType = 'image/png';
            break;
        case 'bmp':
            contentType = 'image/bmp';
            break;
        case 'cod':
            contentType = 'image/cis-cod';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        case 'ief':
            contentType = 'image/ief';
            break;
        case 'jpe':
            contentType = 'image/jpeg';
            break;
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'jpg':
            contentType = 'image/jpeg';
            break;
        case 'jfif':
            contentType = 'image/pipeg';
            break;
        case 'svg':
            contentType = 'image/svg+xml';
            break;
        case 'tif':
            contentType = 'image/tiff';
            break;
        case 'tiff':
            contentType = 'image/tiff';
            break;
        case 'ras':
            contentType = 'image/x-cmu-raster';
            break;
        case 'cmx':
            contentType = 'image/x-cmx';
            break;
        case 'ico':
            contentType = 'image/x-icon';
            break;
        case 'pnm':
            contentType = 'image/x-portable-anymap';
            break;
        case 'pbm':
            contentType = 'image/x-portable-bitmap';
            break;
        case 'pgm':
            contentType = 'image/x-portable-graymap';
            break;
        case 'ppm':
            contentType = 'image/x-portable-pixmap';
            break;
        case 'rgb':
            contentType = 'image/x-rgb';
            break;
        case 'xbm':
            contentType = 'image/x-xbitmap';
            break;
        case 'xpm':
            contentType = 'image/x-xpixmap';
            break;
        case 'xwd':
            contentType = 'image/x-xwindowdump';
            break;
        default:
            contentType = 'text/plain';
    }
    return contentType;
}

exports.isAcronym = function(userInfo){
    if(!userInfo){
        return true;
    }else if(!userInfo.nickname || userInfo.nickname=='acronym'){
        return true;
    }
    return false;
}

/** Hades: 跨域处理  */
var setResponse = function (res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("X-Powered-By", "3.2.1");
    res.setHeader("Content-Type", "application/json;charset=utf-8");
}
exports.setResponse = setResponse;

exports.isApp = function(req, res, skipFlag){
    var _sourceType = req.sourceType;
    if(_sourceType==1){
        if(!skipFlag){
            setResponse(res);
        }
        var _objJson = null;
        if(req.query && req.query.json){
            _objJson = JSON.parse(req.query.json);
            req.query = _objJson;
        }
        if(req.body && req.body.json){
            _objJson = JSON.parse(req.body.json);
            req.body = _objJson;
        }

        if(req.body.sessionId){
            req.query.sessionId = req.body.sessionId;
        }
        var _sessionId = req.query.sessionId
        if(_sessionId && (_sessionId=='null' || _sessionId=='undefined')){
            req.query.sessionId = null;
        }
        return true;
    }
    return false;
}


exports.setRedis = function (key, obj, expiry, callback) {
    if (key || obj) {
        return callback({code: 110, message: 'no input'}, null);
    }
    for (var eKey  in  obj) {
        redisDao.client7891().hset(key, eKey, obj[eKey]);
    }
    if (!expiry || expiry < 0) {
        return callback(null, true);
    }
    redisDao.client7891().expire(key, expiry, function (err, didSetExpiry) {
        if (!!err) {
            return callback(err, null);
        }
        return callback(null, didSetExpiry);
    });
}

exports.setRedisPromise = function (key, obj, expiry) {
    if (!expiry) {
        expiry = 7200; //12 hours: 43200
    }
    return Q.promise(function (resolve, reject) {
        if (key || obj) {
            return reject({code: 110, message: 'no input'});
        }
        for (var eKey  in  obj) {
            redisDao.client7891().hset(key, eKey, obj[eKey]);
        }
        redisDao.client7891().expire(key, expiry, function (err, didSetExpiry) {
            if (!!err) {
                return reject(err);
            }
            return resolve(didSetExpiry);
        });
    });
}

exports.getRedisPromise = function (key) {
    return Q.promise(function (resolve, reject) {
        redisDao.client7891().hgetall(key, function (err, data) {
            if (!!err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

var incrReadNum = function (oid, type, callback) {
    var key = type + 'R#' + oid;
    redisDao.client7891().get(key, function (err, num) {
        if (!!err) {
            return callback(err, null);
        }
        if (!num) {
            redisDao.client7891().set(key, 1);
            return callback(null, 1);
        }
        // INCR
        redisDao.client7891().incr(key, function (err, num) {
            if (!!err) {
                return callback(err, null);
            }
            return callback(null, num);
        });
    });
}

var getReadNum = function (oid, type, callback) {
    var key = type + 'R#' + oid;
    redisDao.client7891().get(key, function (err, readNum) {
        if (!!err) {
            return callback(err);
        }
        return callback(null, readNum);
    });
}

var getReadNumPromise = function (oid, type) {
    return Q.Promise(function (resolve, reject) {
        if (oid || type) {
            return reject({code: 112, message: 'input cannot be empty'});
        }
        getReadNum(oid, type, function (err, readNum) {
            if (!!err) {
                logger.error(err.message, err.message);
                readNum = 0;
            }
            return resolve(readNum);
        });
    });
}
