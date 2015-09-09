/**
 * Created by Hades on 15/6/10.
 */
var request = require('request');
var cheerio = require('cheerio');


request('https://cnodejs.org/', function (error, response, body) {
    var $ = cheerio.load(body);
    var items = [];
    $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element);
        items.push({
            title: $element.attr('title'),
            href: $element.attr('href')
        });
    });
    console.info(items);
});