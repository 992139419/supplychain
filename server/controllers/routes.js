/**
 * Created by tangnian on 14/11/10.
 */
var gitService = require('../models/gitBucketService');
var restaurantService = require('../models/restaurantService');
var operationsService = require('../models/operationsService');
var supplyService = require('../models/supplyService');
var userService = require('../models/userService');
var weixinService = require('../models/weixinService');
var commonService = require('../models/commonService');
var templateService = require('../models/restaurant/templateService');
var inqueySheetService = require('../models/restaurant/InqueySheetService');
var offerSheetService = require('../models/supply/OfferSheetService');
var charts = require('../models/charts');
var smsService = require('../models/sms');
var orderInterface = require('../models/interface');

module.exports = function (app) {

    app.get('/logout', userService.logout);
    //微信登录入口,会夹带参数来请求,并判断用户登录类型,和注册权限
    app.get('/loginModifyNamePage', userService.loginModifyNamePage);
    app.get('/loginModifyName', userService.loginModifyName);
    app.get('/login', userService.weixinlogin);
    app.post('/register', userService.register);
    app.get('/choose', userService.choose);
    app.get('/use', userService.use);
    app.get('/look', userService.look);
    app.get('/create', userService.create);
    app.post('/getCheckCode', userService.getCheckCode);
    app.post('/addResturant', userService.addResturant);
    app.post('/updateUserIsAvb',userService.updateUserIsAvb);
    //添加分店信息
    app.post('/addChainRest', userService.addChainRest);
    app.post('/addSupply', userService.addSupply);
    app.get('/addResturantPage', userService.addResturantPage);
    app.get('/addChainRestaurantPage',userService.addChainRestaurantPage);
    app.get('/addSupplypage', userService.addSupplypage);
    app.get('/nextStep', userService.nextstep);
    app.post('/sendSms',smsService.sendSmsAjax);
    //cms
    app.get('/cmsLogin', operationsService.cmsLogin);
    app.post('/cmsLogin', operationsService.login);
    app.get('/cmsLogout', operationsService.logout);
    app.post('/cmsRegister', operationsService.register);
    app.get('/cmsGetSupply', operationsService.cmsGetSupply);
    app.get('/cmsGetRestaurant', operationsService.cmsGetRestaurant);
    app.post('/cmsDelSupply', operationsService.cmsDelSupply);
    app.post('/cmsDelRestruant', operationsService.cmsDelRestruant);
    app.get('/cmsGetCategory', operationsService.cmsGetCategory);
    app.post('/cmsDelCategory', operationsService.cmsDelCategory);
    app.get('/cmsGetPrice', operationsService.cmsGetPrice);
    app.post('/cmsDelPrice', operationsService.cmsDelPrice);
    app.post('/cmsAddPrice', operationsService.cmsAddPrice);
    app.post('/cmsAddCustMetiral', operationsService.cmsAddCustMetiral);
    app.post('/cmsUpdatePrice', operationsService.cmsUpdatePrice);
    app.post('/cmsAddCategory', operationsService.cmsAddCategory);
    app.get('/cmsQueryOrder', operationsService.cmsQueryOrder);
    app.get('/cmsOrderItemList', operationsService.cmsOrderItemList);
    app.post('/getOrderItem', operationsService.fetchOrderItem);
    app.get('/cmsShowMateriesInfo', operationsService.cmsShowMateriesInfo);
    app.get('/cmsGetCategoryDetail',operationsService.cmsShowCategoryInfo);
    app.get('/cmsTemplateMng', operationsService.cmsTemplateMng);
    app.post('/cmsDelTemplate', operationsService.cmsDelTemplate);
    app.get('/cmsTemplateAdd', operationsService.cmsTemplateAdd);
    app.post('/cmsAddTemplate', operationsService.cmsAddTemplate);
    app.post('/cmsGetResDetails', operationsService.getResturantDetials);
    app.post('/cmsGetSupplyDetails', operationsService.getSupplyDetials);
    app.get('/cmsGetCustMetiral', operationsService.getCustMetiral);
    app.post('/cmsGetOrderDetails', operationsService.getOrderDetails);
    app.get('/cmsGetMembers',operationsService.getMembersForResturant);
    app.post('/cmsDisMember',operationsService.cmsDisMember);
    app.post('/cmsAppvCustMe',operationsService.cmsAddCustMetiral);
    app.post('/data2Excel',operationsService.toexcel);
    app.post('/printOrder',operationsService.printOrder);
    app.post('/appvCustMe',operationsService.appvCustMe);
    app.post('/querychainStored',operationsService.querychainStored);


    app.get('/cmsresetPassord',operationsService.cmsresetPwd);
    app.post('/resetPwd',operationsService.resetPwd);


    //##### 餐厅系统 start ######
    app.get('/resIndex', restaurantService.resIndex);
    app.get('/indexTab1', restaurantService.indexTab1);
    app.get('/indexTab2', restaurantService.indexTab2);
    app.get('/my', restaurantService.jumpddMyPage);
    app.get('/myorder', restaurantService.myOrders);
    app.get('/getSupplyPrice', restaurantService.getSupplyDetails);
    app.get('/getMaterialByName', restaurantService.getMaterialByName);
    app.get('/userInfoSetting', restaurantService.saveUserInfoSetting);
    app.get('/userSetting', restaurantService.userSetting);
    //app.get('/getOrders',restaurantService.getOrdersByStatus);
    app.get('/addComments', restaurantService.addComments);
    app.get('/saveComments', restaurantService.saveComments);
    app.get('/getOrderDetail', restaurantService.getOrderById);
    app.post('/addTemplate', templateService.intiMaterial);
    app.post('/template_Confirm', templateService.templateConfirm);
    app.post('/templateConfirmUpdate', templateService.templateConfirmUpdate);
    app.post('/addTemplateCommit', templateService.addTemplateservice);
    app.get('/myTempalte', templateService.getTemplate);
    app.post('/getMaterialAjax', templateService.getMaterialByCgId);
    app.post('/updateTemplate', templateService.updateTemplate);
    app.post('/mergeOrders', restaurantService.mergeOrders);
    app.post('/confOrder', restaurantService.confReceivedOrder);
    app.post('/updateMechanismInfo',restaurantService.updateMechanismInfo);
    //删除模版
    app.post('/deleteTemplate', templateService.deleteTemplate);
    app.get('/addCuMaterial',templateService.addCuMaterial);
    app.post('/addCustomerMaterial',templateService.addCustomerMaterial);
    app.post('/searchMaterial',templateService.searchMaterial);
    app.get('/updateCuMaterial',templateService.updateCuMaterial);
    app.post('/updateCuMaterial',templateService.updateCustomerMaterial);
    app.post('/deleteCustomerMaterial', templateService.deleteCustomerMaterial);
    //下拉加载
    app.post('/newmokuai', templateService.newmokuai)
    app.get('/getFavMaterial', restaurantService.getFavMaterial);
    app.get('/getFavSupply', restaurantService.getFavSupply);
    app.get('/getPublicSheets', restaurantService.getPublicOfferShet);
    app.get('/getOfferDetails', restaurantService.getOfferSheetDetials);
    app.post('/queryDistInformation', restaurantService.queryDistInformation);

    //餐厅系统询价单模块
    app.get('/myTempalteRead', inqueySheetService.getTemplateRead);
    app.get('/priceInquery', inqueySheetService.priceInquery);
    app.get('/addIqrySheetchoose', inqueySheetService.addIqrySheetchoose);
    app.get('/templateMaterialList', inqueySheetService.templateMaterialList);
    app.post('/addInquerySheet', inqueySheetService.addInquerySheet);
    app.get('/user_defined_copy', inqueySheetService.userDefinedCopy);
    app.get('/qryInSheet', inqueySheetService.qryInSheet);
    app.get('/toAddtemplate02', inqueySheetService.intiMaterial);
    app.post('/templateConfirmforInsheet', inqueySheetService.templateConfirmforInsheet);
    app.get('/chooseContacts', inqueySheetService.chooseContacts);
    app.post('/updateInquerySheet', inqueySheetService.updateInquerySheet);


    //下订单
    app.post('/addOrderFromRe', inqueySheetService.addOrder);
    //新订单修改订单操作
    app.post('/updateOrderforPendind',restaurantService.updateOrderforPendind);
    //订单详情
    app.get('/queryOrderDetails', restaurantService.queryOrderDetails);
    //我的机构
    app.get('/queryMechanismByuser', restaurantService.queryMechanismByuser);
    app.get('/queryMechanismDetails', restaurantService.queryMechanismDetails);
    //关注／取消 食材
    app.get('/setFavMaterial', restaurantService.setFavMaterial);
    app.get('/qryOfferSheetforInquery', inqueySheetService.qryOfferSheet);
    app.post('/qryOfferSheetById', inqueySheetService.qryOfferSheetById);
    app.get('/qryOfferSheetById', inqueySheetService.qryOfferSheetById);
    app.post('/addOfferSheetItem', inqueySheetService.addOfferSheetItem);
    //联系我们
    app.get('/contactUs', userService.contactUs);
    //选择食材查看价格走势
    app.get('/selectMaterialPT', templateService.selectMaterialPT);
    //查看价格走势
    app.get('/viewMaterialPT', restaurantService.viewMaterialPT);
    //我的供应商－常用联系人
    app.get('/resContacts', restaurantService.resContacts);
    //我的供应商－常用联系人删除
    app.get('/resDelContacts', restaurantService.resDelContacts);
    //个人设置
    app.post('/saveuserInfo', restaurantService.saveUserInfoSetting);
    app.get('/getPendingOrders', restaurantService.getPendingOrders);
    //餐厅添加组员
    app.get('/myteamMember01', restaurantService.myteamMember01);
    //组员设置餐厅
    app.get('/setRestaurantPage', restaurantService.setRestaurantPage);
    app.post('/setRestaurant', restaurantService.setRestaurant);

    //####### 供应商系统 start #########
    app.get('/supIndex', supplyService.supIndex);
    app.get('/myForsupply', supplyService.jumpddMyPage);
    app.get('/getInqueryRest', supplyService.getInqueryResturants);
    app.get('/fetchInqSheetList', supplyService.getInqSheetList);

    //报价单模块
    app.post('/updateOfferSheetById', offerSheetService.updateOfferSheetById);
    app.post('/offerSheetNewMaterial', offerSheetService.offerSheetNewMaterial);
    app.get('/qryOfferSheet', offerSheetService.qryOfferSheet);
    app.get('/addOfferSheetchoose', offerSheetService.addOfferSheetchoose);
    app.get('/chooseMaterial', offerSheetService.intiMaterial);
    app.post('/addOfferSheet', offerSheetService.addOfferSheet);
    app.get('/templateListForOffer', offerSheetService.getTemplateRead);
    app.get('/temMaterialForOffer', offerSheetService.templateMaterialList);
    app.get('/showOfferSheetInfo', offerSheetService.showOfferSheetInfo);
    app.post('/updatePublicOffer', offerSheetService.updatePublicOffer);
    app.post('/updateOfferSheer', offerSheetService.updateOfferSheer);
    app.post('/supChooseContacts', offerSheetService.chooseContacts);
    app.post('/queryMaterials', offerSheetService.queryMaterials);
    //订单配送
    app.get('/addDistributionChoose', offerSheetService.addDistributionChoose);
    app.get('/templateListForDist', offerSheetService.getTemplateReadForDist);
    app.get('/temMaterialForDist', offerSheetService.templateMaterialListForDist);
    app.post('/chooseContactDist', offerSheetService.chooseContactDist);
    app.post('/saveOrderDist', offerSheetService.saveOrderDist);
    app.get('/chooseMaterialDist', offerSheetService.intiMaterialDist);
    app.post('/queryMaterialsDist', offerSheetService.queryMaterialsDist);
    app.post('/queryDistInformationOffer', restaurantService.queryDistInformationOffer);
    //我的餐厅－常用联系人
    app.get('/supContacts', supplyService.supContacts);
    //我的餐厅－常用联系人删除
    app.get('/supDelContacts', supplyService.supDelContacts);
    //供应商这边询价单查询
    app.get('/supPriceInquery', supplyService.priceInquery);
    //供应商 我的订单
    app.get('/supMyOrder', supplyService.supMyOrders);
    //供应商 配送订单
    app.post('/sendingOrder', supplyService.sendingOrder);
    //供应商 单询价单查询
    app.get('/qryInqueryById', supplyService.qryInqueryById);
    //供应商对餐厅询价进行报价
    app.post('/offerToRestruantd', offerSheetService.offerToRestruantd);
    //供货商添加组员
    app.get('/myTeamMember02', supplyService.myteamMember02);

    //########共用的页面
    app.get('/setUserAuthPage', commonService.setUserAuthPage);
    app.post('/setUserAuth', commonService.setUserAuth);
    app.get('/myteamMember', commonService.myteamMember);
    app.get('/addUser', commonService.addUserPage);
    app.post('/addUser', commonService.addUser);
    app.get('/myfriend', commonService.myfriendPage);
    app.get('/addFriend', commonService.addFriendPage);
    app.post('/addFriend', commonService.addFriend);
    app.get('/addContactsPage', commonService.addContactsPage);
    app.get('/addContacts', commonService.addContacts);
    app.get('/getOrderByIdModel', commonService.getOrderByIdModel);
    app.get('/qryInqueryByIdCommon',commonService.qryInqueryById);
    app.get('/qryOfferSheetByIdCommon',commonService.qryOfferSheetById);
    app.post('/queryDistInformationCommon',commonService.queryDistInformation);
    app.post('/updateFavMetrial',commonService.updateFavMetrial);
    //发送邀请函
    app.post('/sendContactsConfirm', commonService.sendContactsConfirm);
    //    app.get('/bingdingfriends', commonService.bingdingfriends);

    //app.get('/weixin', weixinService.weixinCheck);
    app.get('/wxcallback', weixinService.wxcallback);

    app.get('/getUserInfo', userService.getUserInfo);
    app.get('/addContactCallBack', userService.addContactCallBack);
    //微信服务
    //app.post('/weixin', weixinService.weixin);
    app.get('/test', function (req, res) {
        res.render('admin/test');
    });
    app.get('/wxTest', userService.wxTest);
    //slack 勾子
    app.get('/testSlack', restaurantService.testSlack);
    //价格趋势
    app.get('/chartsQ', charts.chartsQ)
    //微信进行JSAPI接口操作验证的参数获取
    app.post('/getQMData', weixinService.getQMData);
    //测试路由
    app.get('/cs', function (req, res) {
        res.render('admin/newq')
    })

    //点菜系统接口
    app.get('/queryMaterialInfo', orderInterface.queryMaterialInfo);
    app.get('/queryOrderInfo', orderInterface.queryOrderInfo);
    app.get('/upDataOrderSynchronous', orderInterface.upDataOrderSynchronous);

    app.get('/daoTest', commonService.daoTest);

};



