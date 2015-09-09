var request = require('request');
//var request=require("request-promise");
var $ = require('cheerio');
var iconv = require('iconv-lite');
var index = function () {
    //var options={
    //    url:'http://nc.mofcom.gov.cn/channel/gxdj/jghq/jg_list.shtml?par_craft_index=13075&craft_index=20410&startTime=2015-06-01&endTime=2015-06-10&par_p_index=&p_index=&keyword=&page=1',
    //    method:'get'
    //}
    //request(options).then(function(response){
    //        console.log(response);
    //    });
    request.get({
        url: 'http://nc.mofcom.gov.cn/channel/gxdj/jghq/jg_list.shtml?par_craft_index=13075&craft_index=20410&startTime=2015-06-01&endTime=2015-06-10&par_p_index=&p_index=&keyword=&page=1',
        encoding:null
    }, function (error, response, body) {
        console.log("111111"+(!error&&response.statusCode==200));
        if (!error && response.statusCode == 200) {
            console.log("111111");
            var charset="utf-8";
            var arr=body.toString().match(/<meta([^>]*?)>/g);
            if(arr){
                arr.forEach(function(val){
                    var match=val.match(/charset\s*=\s*(.+)\"/);
                    if(match && match[1]){
                        if(match[1].substr(0,1)=='"')match[1]=match[1].substr(1);
                        charset=match[1].trim();
                        return false;
                    }
                })
            }
            var body = require('iconv-lite').decode(body, charset);
            console.log(body);
            var movie = {};
            var name = $(body).find('table tbody tr');
            //console.log();
            for (var i = 0; i < name.length; i++) {
                var tds = $('td', name[i]);
                console.info($(tds[0]).text());
                console.info($(tds[1]).text());
                console.info($('a',tds[2]).text());
                console.info($(tds[3]).text());
                //var name = $(tds[0]).html();
                //var price = $(tds[1]).html();
                //var market = $(tds[2]).html();
                //var date = $(tds[3]).html();
                //console.info(name + ":" + price + ":" + market + ":" + date);
                console.info('########################################################################################');
            }
            //console.log(name);
            console.log(name.length);
        }
    });
};
index();