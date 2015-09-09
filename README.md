# 任务分配图
![wxtask](http://git.codinghacker.com/uploads/CodingHacker/wxrestaurant/270f6a5a40/wxtask.jpg)

# 情况纪录
1: 作为元数据的material食材，如果删除掉，关联到他的订单，报价单，询价单，会出现问题。
2: 我的组员页面 只有在餐厅／供应商管理界上才会出现

# 项目响应状态码
*100 成功
*101 执行成功，但是不存在
*201 未登录
*500 系统错误
*400 不能为空
*300 没有权限
*301 非同一种类型用户

//用户

User{
   _id
   userName string 用户账号
   password string 账号密码
   status   string 是否关注 0:没有关注  1:关注
   userType string 用户类型 0:平台用户，1:餐厅用户，2:供应商用户
   userAuth string 用户权限 0:普通用户 1:管理员
   isGuest  string 是否是游客  0:游客用户  1:非游客用户
   headMechanismId string 总店单位Id
   headMechanismName string 总店单位名称
   mechanism_id string 所属单位机构Id(供应商或者餐厅)
   mechanism_name string 单位机构名称
   openId string 微信公众号识别Id
   source string  登录方式 0:填写登录，1:第三方微信登录（目前只开放微信）
   //用户认证
   realName  真实姓名
   mobileNo  手机号码
   emailAddress 邮箱地址
   favMetrial [ID]  关注材料
   favSupply [ID]  关注供应商
   myFriends [userName] 我的好友
   isConfirme string 是否具备确定权限（餐厅：发起询价／确认订单，供应商：确定报价） 0:否，1:确
   isAvab string 是否可用,ture 可用， false 不可用
}

//物料类别
Category{
   _id 内置id
   name string 类型名字
   remark string 备注
}

//订单

Orders{
   _id string 订单编号
   orderNo string 订单编号
   orderName string 订单名字
   createById string 创建人id
   createBy string 创建者
   createAt  Date 创建时间
   orderStatus  string 订单状态[P:peding,新建订单等待付款,N:已付款未配送,S: sending，已配送阶段,R:已经完成配送，但是还未评价，Received,C:commented:已评价订单]
   orderItem:    订单交易项目：
      [{materialId :ref_MaterialId 食材Id
       materialName string 食材名称
       materialPrice string 价格
       unit string 单位
       remark string 备注描述
       number string 数量
       paidIn string 实收数量
      }],
   sum: string 订单总价
   comments: string, 订单评论
   toSupply,  string 对应商家的id
   supplyName string 供应商名称
   restruantId string 订单所属餐厅ID
   restruantName string 餐厅名称
   remark string 备注  预留字段
   tradeStatus string 交易状态 0:未付款，1:已付款，2:款到账，3:款未到账，4:状态异常,5:取消交易
   receiverId string 收货人id
   receiver string, 收货人
   receiverAddress,收货地址
   offerSheetId string 订单所对应的报价单id
   mobile string 餐厅收货电话
   comfirmeUserId string 下单人id
   comfirmeUserName 下单人名称
   shipperId string 发货人ID
   shipper string 发货人
   isSynchronous string 是否已同步（针对点菜系统验收订单接口） 0:未同步，1:已同步
}

//食材

Material{
    _id 内置id
    name string 食材名称
    minPrice string 最低价格
    price string 平台提供参考价格
    categoryId string 物料类别ID
    categoryName string 物料类别名称
    remark string 备注
 // refSupplyId string 供应商id
    unit string 单位
    supplyNum int 供应商数量
    supplysIds [string] 供应商ID数组
    restaurantNum int 餐厅询价数量
    restaurantIds [string] 餐厅数组
    refPic,  string,  对应图片文件名，用于主页显示
    －－－－如果是自定义食材，才会有这3个字段
    isCustomer string 是否是自定义食材 0:否  1:是
    mechanism_id  string 所属机构id（食材creator）
    mechanism_name string 所属机构名称
    mechanism_type string 1，2（1餐厅｜2供应商）
    isExamine  string   0:未审核，1:已审核
}



//餐厅模板

Template{
    _id 内置id
    name string 模版名称
    materials 数组 模版所选物料信息 -- value{ _id,name,unit,remark}
    type string 0:平台用户 1:餐厅，2:供应商
    mechanism_id stirng 所属机构ID  其中运营者为A；
}

//供应商公开报价食材信息表
SupplyPrice{
_id 内置id
name string 报价单名字
material_id，食材ID
material_name 食材名称
isOffer string 是否提供报价（0:否，1:是）
price string 价格
unit      单位
remark 备注
supply_id string  所属供应商id
supply_Name string 所属供应商名字
isPublic string 0:不公开 1:公开
contactNo string   供应商联系方式
}

//供应商爬取数据

SupplySpider{

   source string 来源
   materialType string 类型
   materialName string 爬取名称
   name string 运营者指定名称
   createD string 爬取时间，按天计算。
   market string 市场
   price string 价格

}
//供应商
Supply{
   _id 内置ID
   name string 供应商名称
   header string 负责人姓名
   remark string 备注
   address string 地址
   area string 地区
   telephone string 电话号码
   isAvab boolean 是否可用 ture未禁用，false:被禁用
   subscribeMaterial[]: 关注食材
}

//餐厅

Restruant{
   _id 内置ID
   name string 餐厅名称
   header string 负责人姓名
   remark string 备注
   reqMaterial[id]: 必备食材
   subscribeMaterial[]: 关注食材
   telephone string 电话号码
   area string 地区
   address string 餐厅地址
   chainStoredIds [id]:  分店id
   isHead string 是否总店 0:不是,1:是
    isAvab boolean 是否可用 ture未禁用，false:被禁用
}



//餐厅公开询价食材表
CInquerySheet
_id 内置id
name string 询价单名字
    material_id，食材ID
    material_name 食材名称
    material_unit
    material_remark
restruantId string 所属餐厅id
headMechanismId string 总餐厅id
restruantName string 所属餐厅名字
}



//餐厅询价单
InquerySheet{
_id 内置id
name string 询价单名字
materials 数组 询价单所选食材信息
－－－value(
    material_id，食材ID
    material_name 食材名称
    material_unit 单位
    material_remark 备注描述
    isInquery string 是否询价 0:否，1:是)
restruant_id string 所属餐厅id
restruantName string 所属餐厅名字
isPublic string 0:不公开 1:公开
start string 0:未开始询价,1:已询价,2:已报价(关闭)
createUserId  string  询价单创建者id
comfirmeUserId string   询价人id
supplyId 供应商id
supplyName 供应商名称
}



//供应商报价单
OfferSheet{
_id 内置id
name string 报价单名字
materials 数组 报价单所报价食材信息
－－－value(
    material_id，食材ID
    material_name 食材名称
    isOffer string 是否提供报价（0:否，1:是）
    price string 价格
    unit 单位
    remark 备注)
supply_id string 所属供应商id
supplyName string 所属供应商名称
isPublic string 0:不公开 1:公开
restruantdId string 所询价餐厅id
restruantdName string 所询价餐厅名称
start string 0:未报价，1:已报价 2:关闭（餐厅已下单）
createUserId  string    报价单创建者id
comfirmeUserId string   报价确认人id
}

//常用联系人（供应商／餐厅）常用联系人 ,对于餐厅用户，其为常联系供应商；对于供应商，其为常联系餐厅
//由于引入分店的概念，且要求常用联系人要求为总分店共享信息，所以这个地方的mechanism_id 关联需要修改为关联总店的id
FrequentContacts{
  _id 内置id
  mechanism_type string 0:平台,1:餐厅，2:供应商
  mechanism_id string 机构id
  contacts 数组 联系人id
}

//食材报价，订单，配送历史记录表
MaterialHistory{
    _id 内置id
    materialId string 食材id
    materialName string 食材名称
    unit string 单位
    number string 数量
    price string 价格
    remark string 备注
    mechanismId string 所属机构id
    mechanismName string 所属机构名称
    mechanismType string  所属机构类型
}
