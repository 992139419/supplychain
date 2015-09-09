/**
 * Created by zhaochunhu on 15/5/26.
 */
//用户登录
function login(){
     var userName=document.getElementById('userName').value;
     var password=document.getElementById('password').value;
     var userData={userName:userName,password:password};
    $.post("/login",userData,function(data){
         var code =data.code;
         if(code==000){
             window.location.href="/choose";
         }
     });

}

//登录用户 点击免费使用
function use(){
    window.location.href="/use";
}

//登录用户 随便看看
function look(){
    window.location.href="/look";
}

//添加餐厅信息
function addResturant(){
    var restaurant=document.getElementById('restaurant').value;
    var name=document.getElementById('name').value;
    var telephone=document.getElementById('telephone').value;
    var address=document.getElementById('address').value;
    var resturantData={restaurant:restaurant,name:name,telephone:telephone,address:address};
    $.post("/addResturant",resturantData,function(data){
        var code =data.code;
        if(code==101){
            alert("添加信息成功");
        }
    });


}

//获取验证码
function  getCheckCode(req,res){
    var mPhoneNumber=document.getElementById('mPhoneNumber').value;
    $.post("/getCheckCode",{mPhoneNumber:mPhoneNumber},function(data){
    });
}

//用户注册
function register(){
    var mPhoneNumber=document.getElementById('mPhoneNumber').value;
    var verificationCode=document.getElementById('verificationCode').value;
    var setPassword=document.getElementById('setPassword').value;
    var password=document.getElementById('password').value;
    var registerData={mPhoneNumber:mPhoneNumber,verificationCode:verificationCode,setPassword:setPassword,password:password};
    $.post("/register",registerData,function(data){
        var code =data.code;
        if(code==101){
            alert("注册成功");
            window.location.href="/login";
        }else if(code==102){
            alert("已经注册 请直接登录");
            window.location.href="/login";
        }else{
            alert("系统问题");
        }
    });


}

//第三方登录
function  login_01(){

}
function  login_02(){

}
function  login_03(){

}

//忘记密码
function  lostpassword(){

}