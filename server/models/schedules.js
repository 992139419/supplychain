var later = require('later');


var sched = later.parse.text('every 5 mins');
var occurrences = later.schedule(sched).next(2);
console.info(occurrences.length);
occurrences.forEach(function(occurrence){
   console.log(occurrence);
});
var number = 0;
var t = later.setInterval(function(){
    console.info('now:'+new Date());
    console.info('number:'+number++);
},sched);