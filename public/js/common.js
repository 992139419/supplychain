////微信隐藏分享
//function onBridgeReady(){
//    WeixinJSBridge.call('hideOptionMenu');
//}
//
//if (typeof WeixinJSBridge == "undefined"){
//    if( document.addEventListener ){
//        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//    }else if (document.attachEvent){
//        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//    }
//}else{
//    onBridgeReady();
//}
//添加项目相关js



// //对浏览器的UserAgent进行正则匹配，不含有微信独有标识的则为其他浏览器
//var useragent = navigator.userAgent;
//if (useragent.match(/MicroMessenger/i) != 'MicroMessenger') {
//    // 这里警告框会阻塞当前页面继续加载
//    //alert('已禁止本次访问：您必须使用微信内置浏览器访问本页面！');
//    // 以下代码是用javascript强行关闭当前页面
//    var opened = window.open('about:blank', '_self');
//    opened.opener = null;
//    opened.close();
//}


//存储
var storage = {

    localStorage: window.localStorage,

    setValue: function setValue(key, value) {
        storage.localStorage.setItem(key, value);
    },

    getValue: function getValue(key) {
        return storage.localStorage.getItem(key);
    },

    remove: function remove(key) {
        storage.localStorage.removeItem(key);
    }

}

//ajax调用
function Ajax() {
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHttp");
    }
    this.get = function (url, success, fail, noShow) { //get请求
        if (!noShow) {
            var aa = document.querySelectorAll(".newpage")[0]
            if (aa) {
                aa.style.display = 'block';
            } else {
                var di = document.createElement('div');
                di.className = 'newpage'
                var tex = '<div class="newpage_q"></div>'
                di.innerHTML = tex;
                document.querySelectorAll("body")[0].appendChild(di)
                var aa = document.querySelectorAll(".newpage")[0]
                aa.style.display = 'block';
            }
        }
        _openId = window.localStorage.getItem('openId');
        if (url.indexOf('?') > -1) {
            url = url + '&openId=' + _openId;
        } else {
            url = url + '?openId=' + _openId
        }
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var txt = xhr.responseText;
                    var ch = txt.charAt(0);
                    if (ch == "[" || ch == "{") {//json类型
                        txt = eval("(" + txt + ")");
                        success(txt);
                    } else {
                        success(txt);
                    }
                    if (!noShow) {
                        var aa = document.querySelectorAll(".newpage")
                        if (aa[0]) {
                            for(var i = 0;i<aa.length;i++){
                            aa[i].style.display = 'none';
                            }
                        } else {
                            var di = document.createElement('div');
                            di.className = 'newpage'
                            var tex = '<div class="newpage_q"></div>'
                            di.innerHTML = tex;
                            document.querySelectorAll("body")[0].appendChild(di)
                            var aa = document.querySelectorAll(".newpage")[0]
                            aa.style.display = 'none';
                        }
                    }
                } else {
                    if (fail) {
                        fail(xhr.status);
                    }
                }
            }
        };
        xhr.send(null);
    };


    this.post = function (url, param, success, fail, noShow) {//post请求

        if (!noShow) {
            var aa = document.querySelectorAll(".newpage")[0]
            if (aa) {
                aa.style.display = 'block';
            } else {
                var di = document.createElement('div');
                di.className = 'newpage'
                var tex = '<div class="newpage_q"></div>'
                di.innerHTML = tex;
                document.querySelectorAll("body")[0].appendChild(di)
                var aa = document.querySelectorAll(".newpage")[0]
                aa.style.display = 'block';
            }
        }

        param.openId = window.localStorage.getItem('openId');
        xhr.open("POST", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var txt = xhr.responseText;
                    var ch = txt.charAt(0);
                    if (ch == "[" || ch == "{") {//json类型
                        txt = eval("(" + txt + ")");
                        success(txt);
                    } else {
                        success(txt);
                    }
                    if (!noShow) {
                        var aa = document.querySelectorAll(".newpage")
                        if (aa[0]) {
                            for(var i = 0;i<aa.length;i++){
                                aa[i].style.display = 'none';
                            }
                        } else {
                            var di = document.createElement('div');
                            di.className = 'newpage'
                            var tex = '<div class="newpage_q"></div>'
                            di.innerHTML = tex;
                            document.querySelectorAll("body")[0].appendChild(di)
                            var aa = document.querySelectorAll(".newpage")[0]
                            aa.style.display = 'none';
                        }
                    }
                } else {
                    if (fail) {
                        fail(xhr.status);
                    }
                }
            }
        };
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(this.formatParams(param));
    };

    this.formatParams = function (data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        //暂时放弃，开启缓存
        //arr.push(("v=" + Math.random()).replace(".", ""));
        return arr.join("&");
    }
}
//初始化init
var $ = new Ajax();

//通用ajax加载页面
var regDetectJs = /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/ig;
var regGetJS = /<script(.|\n)*?>((.|\n|\r\n)*)?<\/script>/im;

function pageLoad(url, title, noHistory) {
    $.get(url, function (data) {
            if (data.errmsg) {
                alert(data.errmsg);
                return;
            }
            if (!noHistory) {
                //重写浏览器的history
                var state = {
                    title: title ? title : '',
                    url: url,
                    type:''
                };
                window.history.pushState(state, title ? title : '', url);

            }
            var newDiv = document.createElement('div');
            newDiv.setAttribute("id", "pageContent");
            var oldDiv = document.getElementById('pageContent');
            newDiv.innerHTML = data;
            document.body.replaceChild(newDiv, oldDiv);
            var jsContained = data.match(regDetectJs);
            if (jsContained) {
                var jsNums = jsContained.length;
                for (var i = 0; i < jsNums; i++) {
                    var jsSection = jsContained[i].match(regGetJS);
                    if (jsSection[2]) {
                        if (window.execScript) {
                            // ie
                            window.execScript(jsSection[2]);
                        } else {
                            // other
                            window.eval(jsSection[2]);
                        }
                    }
                }
            }
        }
    );
}

function pageLoadPost(url, param, title, noHistory, type) {
    $.post(url, param, function (data) {
        if (data.errmsg) {
            alert(data.errmsg);
            return;
        }
        if (!noHistory) {
            //重写浏览器的history
            var state = {
                title: title ? title : '',
                url: url,
                data: param ? param : {},
                type: type ? type : ''
            };
            window.history.pushState(state, title ? title : '', url);
        }
        var newDiv = document.createElement('div');
        newDiv.setAttribute("id", "pageContent");
        var oldDiv = document.getElementById('pageContent');
        newDiv.innerHTML = data;
        document.body.replaceChild(newDiv, oldDiv);
        var jsContained = data.match(regDetectJs);
        if (jsContained) {
            var jsNums = jsContained.length;
            for (var i = 0; i < jsNums; i++) {
                var jsSection = jsContained[i].match(regGetJS);
                if (jsSection[2]) {
                    if (window.execScript) {
                        // ie
                        window.execScript(jsSection[2]);
                    } else {
                        // other
                        //cs
                        var aa = document.querySelectorAll(".newpage")[0]
                        if (aa) {
                            aa.style.display = 'none';
                        } else {
                            var di = document.createElement('div');
                            di.className = 'newpage'
                            var tex = '<div class="newpage_q"></div>'
                            di.innerHTML = tex;
                            document.querySelectorAll("body")[0].appendChild(di)
                            var aa = document.querySelectorAll(".newpage")[0]
                            aa.style.display = 'none';
                        }
                        window.eval(jsSection[2]);
                    }
                }
            }
        }
    });
}

window.onpopstate = function () {
    var state = window.history.state;
    if (state.type && state.type == 'post') {
        if (state.url) {
            pageLoadPost(state.url, state.data, state.title, true, 'post');
        }
    } else {
        if (state.url) {
            pageLoad(state.url, state.title, true);
        }
    }

}

/**
 * @Author liangyifen@codinghacker.com
 * @constructor
 */
function MaterialsTemp() {

    //选中的食材集合
    var selectArray = new Array();

    this.getSelectArray = function () {
        return selectArray;
    }

    this.setSelectArray = function (selectArray1) {
        selectArray = selectArray1;
    }

    this.searchMaterialAjax = function (materialName) {
        var url = '/searchMaterial';
        var param = {
            materialName: materialName
        };
        $.post(url, param, function (data) {

            var materialArry = data.materials;
            if (!data) {
                document.getElementById("material").innerHTML = '';
                return;
            }
            var str = '';
            materialArry.forEach(function (material) {
                str +=
                    '<div onclick="selectMaterial(\'' + material._id + '\')" id="select_' + material._id + '">'
                    + '<div>' + material.name + '</div>'
                    + '</div>'

            });
            document.getElementById("material").innerHTML = str;


            materialArry.forEach(function (material) {
                selectMaterial(material._id, material.name);
            });
        });
    }

    /**
     * 点击tab页切换事件，加载食材种类
     * @param categoryId 食材类别编号
     */
    this.getMaterialAjax = function (categoryId) {
        var url = '/getMaterialAjax';
        var param = {
            category_Id: categoryId,
            selectArray: JSON.stringify(selectArray)
        };


        $.post(url, param, function (data) {
            var materialArry = data.materials;
            if (!data) {
                document.getElementById("material").innerHTML = '';
                return;
            }
            var str = '';
            //判断是否未自定义食材，如果是则在头部加上新添功能、
            if (categoryId === '1') {
                str +=
                    '<div onclick="pageLoad(\'/addCuMaterial\');">'
                    + '<div>创建</div>'
                    + '</div>';
            }
            materialArry.forEach(function (material) {
                str +=
                    '<div  id="select_' + material._id + '">'
                    + '<div>' + material.name + '</div>'
                    + '</div>'

            });

            document.getElementById("material").innerHTML = str;

            //分辨是否是自定义食材
            //if(categoryId === '1'){
            //    materialArry.forEach(function (material) {
            //        whichElement(material._id);
            //    });
            //}
            materialArry.forEach(function (material) {
                clickMaterialfunction(material._id, material.name);
            });

        });
    }


    /**
     * 食材选中状态更改
     * @param id 食材编号
     */
    function changeStatus(id, name) {
        var select = document.getElementById("select_" + id);

        if (_.indexOfId(selectArray, {_id: id}) != -1) {
            select.className = "green";
        }
    }


    /**
     * 食材选择点击事件绑定
     * @param materials
     */
    function selectMaterial(id, name) {

        var select = document.getElementById("select_" + id);
        changeStatus(id, name);
        select.onclick = function () {
            if (!select.className) {
                select.className = "green";
                //判断集合是否存在该元素，不存在则添加

                if (_.indexOfId(selectArray, {_id: id}) == -1) {
                    selectArray = _.union(selectArray, [{_id: id}]);
                }
            } else {
                select.className = "";
                var index = _.indexOfId(selectArray, {_id: id});
                if (index != -1) {
                    _.removeByIndex(selectArray, index);
                }

            }

        }

    }

    this.clickMaterial = function (id, name) {
        clickMaterialfunction(id, name);
    }

    function clickMaterialfunction(id, name) {
        selectMaterial(id, name);
        whichElement(id);
    }

    /**
     * 自定义食材长按事件
     * @param e
     */
    function whichElement(materailId) {
               //var js
        //var jss
        //var select = document.getElementById("select_" + materailId);
        //select.addEventListener('touchstart', function () {
        //    js = 1
        //    jss = 1
        //    var inner = this.innerText
        //    setTimeout(jsq, 1000);
        //    function jsq() {
        //        js++
        //        if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        //            if (jss == 1) {
        //                alert(inner)
        //            }
        //        }
        //    }
        //}, false)
        //select.addEventListener('touchmove', function () {
        //    js = 0
        //    jss = 2
        //}, false)
        //select.addEventListener('touchend', function () {
        //    js = 0
        //    jss = 2
        //}, false)
        //select.addEventListener('touchcancel', function () {
        //
        //    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        //    } else {
        //        if (js > 1) {
        //            if (document.querySelectorAll(".active")[0].id != "1") {
        //                alert(this.innerText)
        //            } else {
        //                alert(this.innerText + 'zidingyi');
        //            }
        //        }
        //    }
        //
        //    js = 0
        //    jss = 2
        //}, false)
        //
    }
}
//resIndex

/**
 * Created by zhaochunhu on 15/5/26.
 */
//用户登录
function login() {
    var userName = document.getElementById('userName').value;
    var password = document.getElementById('password').value;
    var userData = {userName: userName, password: password, openId: _openId};
    $.post("/login", userData, function (data) {
        var code = data.code;
        if (code == 1010) {
            window.location.href = "/resIndex";
        } else if (code == 1011) {
            window.location.href = "/supIndex";
        } else if (code = 1012) {
            window.location.href = "/choose";
        } else if (code == 102) {
            alert("没有该用户 请注册");
        } else if (code == 103) {
            alert("系统数据错误");
        } else if (code == 104) {
            alert("用户名或者密码错误 请重新输入");
        }
    });
}



//添加餐厅信息
function addResturant() {
    var name = document.getElementById('name').value;
    var header = document.getElementById('header').value;
    var telephone = document.getElementById('telephone').value;
    var area = document.getElementById('area').innerText;
    var address = document.getElementById('address').value;
    var resturantData = {
        openId: _openId,
        name: name,
        header: header,
        area: area,
        telephone: telephone,
        address: address
    };
    $.post("/addResturant", resturantData, function (data) {
        var code = data.code;
        if (code == 101) {
            //待验证
            //var di = document.createElement('div');
            //var htm = '<div class="zhangkai" style="height: 40px;line-height: 40px;padding: 0 15px;border-bottom:1px solid #979797 ">'
            //htm += '总餐厅：'+ name + '<span class="icon icon-unfold-more" style="float: right;height: 40px;line-height: 40px;"></span>'
            //htm += '</div>'
            //htm += '<div class="new_add_q_e" style="display: none">'
            //htm += '<ul class="add_q" style="border-bottom: 1px solid #979797">'
            //htm += '<li>'
            //htm += '<label class="add_q_q" for="name">'
            //htm += '餐厅名称:'
            //htm += '</label>'
            //htm += '<div class="add_q_w" style="color: #333;font-size: 13px">'
            //htm += name
            //htm += '</div>'
            //htm += '</li>'
            //htm += '<li>'
            //htm += '<label class="add_q_q" for="header">'
            //htm += '联系人：'
            //htm += '</label>'
            //htm += '<div class="add_q_w" style="color: #333;font-size: 13px">'
            //htm += header
            //htm += '</div>'
            //htm += '</li>'
            //htm += '<li>'
            //htm += ' <label class="add_q_q" for="telephone">'
            //htm += ' 联系电话：'
            //htm += '</label>'
            //htm += '<div class="add_q_w" style="color: #333;font-size: 13px">'
            //htm += telephone
            //htm += '</div>'
            //htm += '</li>'
            //htm += '<li>'
            //htm += '<label class="add_q_q" for="address">'
            //htm += '区域：'
            //htm += '</label>'
            //htm += '<div class="add_q_w" style="color: #333;font-size: 13px">'
            //htm += area
            //htm += '</div>'
            //htm += '</li>'
            //htm += '<li>'
            //htm += '<label class="add_q_q" for="address">'
            //htm += '地址：'
            //htm += '</label>'
            //htm += '<div class="add_q_w" style="color: #333;font-size: 13px">'
            //htm += address
            //htm += '</div>'
            //htm += '</li>'
            //htm += '</ul>'
            //htm += '</div>'
            //di.innerHTML = htm
            //document.querySelectorAll(".zongdiang")[0].appendChild(di)
            //zhankai();
            //document.querySelectorAll(".new_add_q_q")[0].style.display = "none"
            //document.querySelectorAll(".zongcanting")[0].style.display = "none"

            alert("添加信息成功");
            //window.location.href = "/resIndex?openId=" + _openId;
        } else if (code == 1001) {
            alert("已经添加成功无需在次添加");
        }
    });
}

//添加供货商信息
function addSupply() {
    var name = document.getElementById('name').value;
    var header = document.getElementById('header').value;
    var telephone = document.getElementById('telephone').value;
    var area = document.getElementById('area').innerText;
    var address = document.getElementById('address').value;
    if (!name) {
        document.getElementById('name').focus();
        return alert('供应商名字不能为空！');
    }
    if (document.getElementById('name').value.indexOf('\'') > -1 || document.getElementById('name').value.indexOf('\"') > -1) {
        document.getElementById('name').focus();
        return alert('供应商名不能包含非法字符！');
    }
    if (!header) {
        document.getElementById('header').focus();
        return alert('联系人不能为空！');
    }
    if (document.getElementById('header').value.indexOf('\'') > -1 || document.getElementById('header').value.indexOf('\"') > -1) {
        document.getElementById('header').focus();
        return alert('联系人不能包含非法字符！');
    }
    if (!telephone) {
        document.getElementById('telephone').focus();
        return alert('电话不能为空！');
    }
    if (!/^(1[0-9])\d{9}$/.test(document.getElementById('telephone').value)) {
        document.getElementById('telephone').focus();
        return alert("请填写正确的手机号码");
    }
    if (!area) {
        document.getElementById('area').focus();
        return alert('区域不能为空！');
    }
    if (!address) {
        document.getElementById('address').focus();
        return alert('地址不能为空！');
    }
    if (document.getElementById('address').value.indexOf('\'') > -1 || document.getElementById('address').value.indexOf('\"') > -1) {
        document.getElementById('address').focus();
        return alert('地址不能包含非法字符！');
    }

    var supplyData = {openId: _openId, name: name, header: header, telephone: telephone, area: area, address: address};
    $.post("/addSupply", supplyData, function (data) {
        var code = data.code;
        if (code == 101) {
            alert("添加信息成功");
            window.location.href = "/supIndex?openId=" + _openId;
        } else if (code == 102) {
            alert("你已经注册了一个供货商用户，不能在重新注册供货商");
        }
    });
}

//获取验证码
function getCheckCode(req, res) {
    var mPhoneNumber = document.getElementById('mPhoneNumber').value;
    $.post("/getCheckCode", {openId: _openId, mPhoneNumber: mPhoneNumber}, function (data) {
    });
}

//用户注册
function register(_openId, userType) {
    var mPhoneNumber = document.getElementById('mPhoneNumber').value;
    var setPassword = document.getElementById('setPassword').value;
    var password = document.getElementById('password').value;
    var code = document.getElementById('code').value;
    var registerData = {
        openId: _openId,
        mPhoneNumber: mPhoneNumber,
        setPassword: setPassword,
        password: password,
        code:code,
        userType: userType
    };
    if (!mPhoneNumber) {
        alert('请添加联系电话！');
        return false;
    }
    if (!/^(1[0-9])\d{9}$/.test(mPhoneNumber)) {
        alert("请填写正确的手机号码");
        return false;
    }
    //校验密码是否为空
    if (!setPassword) {
        document.getElementById('setPassword').focus();
        return alert('密码不能为空');
    }
    if (!password) {
        document.getElementById('password').focus();
        return alert('密码不能为空');
    }
    if (password != setPassword) {
        document.getElementById('password').focus();
        return alert('两次密码不匹配');
    }

    $.post("/register", registerData, function (data) {

        var code = data.code;
        if (code == 101) {
            alert("注册成功");
            window.location.href = "/choose?openId=" + _openId;
        } else if (code == 105) {
            alert("已经注册 请直接登录");
            window.location.href = "/choose?openId=" + _openId;
        } else if (code == 200) {
            alert("验证码过期，请重新获取验证码");
        } else if (code == 400) {
            alert('该电话号码已经注册');
        } else if (code == 500) {
            alert('验证码错误');
        }
    });
}

//忘记密码
function lostpassword() {

}

//下拉展开
function number(number) {
    for (var a = 0; a < number.length; a++) {
        number[a].onclick = function () {

            var idd = this.getAttribute('id')
            var iddq = 'tile-collapse-' + idd
            var di = document.querySelectorAll("#" + iddq)[0]
            var sd = di.getAttribute('style')
            if (sd == "display: block;") {
                var collapse = document.querySelectorAll(".collapse")
                for (var fg = 0; fg < collapse.length; fg++) {
                    collapse[fg].style.display = "none"
                }
            } else {
                var collapse = document.querySelectorAll(".collapse")
                for (var fg = 0; fg < collapse.length; fg++) {
                    collapse[fg].style.display = "none"
                }
                di.style.display = 'block';
            }
        }
    }
}


//点击样式
function nav() {
    var nav = document.querySelectorAll("ul.nav")[0].querySelectorAll("li")
    for (var a = 0; a < nav.length; a++) {
        nav[a].onclick = function () {
            document.querySelectorAll(".active")[0].className = ""
            this.className = "active"
        }
    }
}

function guding(hei, gao) {
    if (!gao) {
        gao = 50
    }
    //alert(document.documentElement.clientHeight)
    hei.style.top = document.documentElement.clientHeight - gao + "px"
}
//背景平铺
var hei = document.querySelectorAll(".bj")[0]//大部分背景平铺
if (hei) {
    pingpu(hei)
}
function pingpu(hei) {
    hei.style.height = document.documentElement.clientHeight + "px"
}
//重写alert事件 -缺失图片

function alert(a, b) {
    var ale = document.querySelectorAll(".alert")[0]
    if (!ale) {
        var aler = document.createElement('div');
        var htm = '<div class="alert">'
        //htm += '<div style="width: 50px;'
        //htm += 'height: 50px;'
        //htm += 'background-image: url(images/banner.png);'
        //htm += 'background-size: 100% 100%; margin: auto; margin-top: 10px;'
        //htm += 'border-radius: 5px;">'
        //htm += '</div>'
        htm +='<div></div>';
        htm += '<div  style="width: 100%;text-align: center;color:#FFFFFF;margin-top: 30px">'
        htm += '        </div>'
        htm += '</div>'
        aler.innerHTML = htm
        document.querySelectorAll('body')[0].appendChild(aler)
    }
    ale = document.querySelectorAll(".alert")[0]
    ale.querySelectorAll("div")[1].innerHTML = a
    ale.style.display = "block"
    ale.style.opacity = "1";
    //if (b == 1) {
    //    ale.querySelectorAll("div")[0].style.backgroundImage = "url(images/banner.png)"
    //} else {
    //    ale.querySelectorAll("div")[0].style.backgroundImage = "url(images/bottom_e.png)"
    //}
    setTimeout(function () {
        ale.style.opacity = "0";
    }, 1500);

    setTimeout(function () {
        ale.style.display = "none";
    }, 3000);
}

//阻止浏览器默认事件
function zuzhi(e) {
    // 兼容FF和IE和Opera
    if (e && e.preventDefault) {
//阻止默认浏览器动作(W3C)
        e.preventDefault();
    } else {
//IE中阻止函数器默认动作的方式
        window.event.returnValue = false;
    }
}


//长按弹菜名
var js
var jss
function changan(dj, tc) {
    //dj.addEventListener('touchstart', function () {
    //    jss = 1
    //    js = 1
    //    setTimeout(jsq, 1000);
    //    function jsq() {
    //        js++
    //        //alert(js)
    //        if (jss == 1) {
    //            if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    //                js = 1
    //                jss = 2
    //                alert(tc)
    //            }
    //        }
    //    }
    //}, false)
    //dj.addEventListener('touchmove', function () {
    //    js = 0
    //    jss = 2
    //}, false)
    //dj.addEventListener('touchend', function () {
    //    js = 0
    //    jss = 2
    //}, false)
    //dj.addEventListener('touchcancel', function () {
    //
    //    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    //    } else {
    //        if (js > 1) {
    //            alert(tc)
    //        }
    //    }
    //    js = 0
    //    jss = 2
    //}, false)

}
//截取时间
function time (dat){
    var date = new Date(dat)
    var dateq = {
        "y":date.getFullYear(),
        "f":date.getMonth()+1,
        "d":date.getDate()
    }
    return dateq
}

function updateUserIsAvb(id,userAuth,isAvab){
    var url = '/updateUserIsAvb';
    var data = {
        id:id,
        type:isAvab
    }
    if(isAvab==false){
        if(userAuth==1){
            if (window.confirm('作为管理员,你确定要禁用自己？')) {
                $.post(url,data,function(result){
                    if(result.code==100){
                        document.getElementById('dele').innerText = '激活';
                        document.getElementById('dele').href='javascript:updateUserIsAvb("'+id+'",true)';
                    }
                });
            }
        }else{
            if (window.confirm('确定需要禁用该用户？')) {
                $.post(url,data,function(result){
                    if(result.code==100){
                        document.getElementById('dele').innerText = '激活';
                        document.getElementById('dele').href='javascript:updateUserIsAvb("'+id+'",true)';
                    }
                });
            }
        }

    }else if(isAvab==true){
        if (window.confirm('确定需要激活该用户？')) {
            $.post(url,data,function(result){
                if(result.code==100){
                        document.getElementById('dele').innerText = '激活';
                        document.getElementById('dele').href='javascript:updateUserIsAvb("'+id+'",true)';
                }
            });
        }
    }

}




//模版分页
function fenye(url , fangfan){
    var qubie = document.getElementById('qubie')
    var pageNo = 0
    window.onscroll = function () {
//alert(1)
            //获取滚动条当前的位置
            function getScrollTop() {
                var scrollTop = 0;
                if (document.documentElement && document.documentElement.scrollTop) {
                    scrollTop = document.documentElement.scrollTop;
                }
                else if (document.body) {
                    scrollTop = document.body.scrollTop;
                }
                return scrollTop;
            }
//获取当前可是范围的高度
            function getClientHeight() {
                var clientHeight = 0;
                if (document.body.clientHeight && document.documentElement.clientHeight) {
                    clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
                }
                else {
                    clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
                }
                return clientHeight;
            }

//获取文档完整的高度
            function getScrollHeight() {
                return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            }
            if (getScrollTop() + getClientHeight() == getScrollHeight()) {
                if (qubie) {
                 pageNo++
                var urll = url + "?number=" + pageNo
                $.get(urll, function (data) {
                        if (data.errmsg) {
                            alert(data.errmsg);
                            return;
                        }
                        if (data.templates[0]) {
                            data = data.templates
                          fangfan[0](data)
                        }

                    }
                );


//                $('.spinreturn data;ner').css('display', 'block')
                //            添加方法
            }
        }
    }
}

//模版分页二
function feiyeer(){
    var number = 1
    var templ = document.getElementById("templ")
    window.onscroll = function () {
        //获取滚动条当前的位置
        function getScrollTop() {
            var scrollTop = 0;
            if (document.documentElement && document.documentElement.scrollTop) {
                scrollTop = document.documentElement.scrollTop;
            }
            else if (document.body) {
                scrollTop = document.body.scrollTop;
            }
            return scrollTop;
        }

//获取当前可是范围的高度
        function getClientHeight() {
            var clientHeight = 0;
            if (document.body.clientHeight && document.documentElement.clientHeight) {
                clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
            }
            else {
                clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
            }
            return clientHeight;
        }

//获取文档完整的高度
        function getScrollHeight() {
            return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }


        if (getScrollTop() + getClientHeight() == getScrollHeight()) {
            if(templ){
                var template = document.querySelectorAll(".template li")[2]
                if (template) {
                    var type = template.getAttribute('type');
                    var mechanismId = template.getAttribute('mechanismId');
                }

                $.post('/newmokuai', {type: type, mechanismId: mechanismId, number: number}, function (data) {
                    if (data) {
                        for (var a = 0; a < data.length; a++) {
                            var li = document.createElement("li")
                            li.id = data[a]._id
                            var text = '<div class="template_new_q">'
                            text += '<div>' + data[a].name + '</div>'
                            text += ' <div>' + data[a].createdAt
                            text += ' <div class="icon icon-keyboard-arrow-right"></div>'
                            text += ' <a class="dele" id="' + data[a]._id + '">删除</a></div>'
                            text += ' </div>'
                            li.innerHTML = text
                            document.getElementById("template").appendChild(li);
                            li.onclick = function(){
                                templateMaterialList(this.id)
                                function templateMaterialList(templateId){
                                    pageLoad('/temMaterialForOffer?templateId='+templateId);
                                }
                            }
                        }
                        number++
                    }
                })
            }
        }
    }
}




