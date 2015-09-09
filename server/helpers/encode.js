/**
 * Created by tangnian on 14/11/10.
 */
var hbs             = require('express-hbs'),
    encode;

encode = function (context, str) {
    var uri = context || str;
    return new hbs.handlebars.SafeString(encodeURIComponent(uri));
};

module.exports = encode;
