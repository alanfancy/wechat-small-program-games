//检查session中的token是否存在
let codeData=require("./getcode.js");
let app=getApp();
let userState='';
function getInfoRequest(utype,udata){
  return new Promise((resolve, reject) => {
      let _url = "";
      if(utype=="code"){
        wx.removeStorageSync('code');
        //code换取用户信息
        _url = app.requestUrl + "get-user-info-by-code?code=" + udata;
      }else{
        //token换取用户信息
        _url = app.requestUrl + "get-user-info-by-access-token?access_token=" + udata;
      }
      wx.request({
        url: _url,
        success: function (res) {
          //console.log("请求用户数据：");
          //console.log(res);
          if (res.data.state == 1) {
            wx.setStorageSync('access_token', res.data.member_data.access_token);
            wx.setStorageSync('mobile', res.data.member_data.mobile);
            wx.setStorageSync('level', res.data.member_data.level);
            wx.setStorageSync('title', res.data.member_data.title);
            wx.setStorageSync('mental', res.data.member_data.mental);
            wx.setStorageSync('rand', res.data.member_data.rand);
            resolve({
              state: 1,
              msg: "信息储存成功",
              data: {
                mobile: res.data.member_data.mobile,
                token: res.data.member_data.access_token,
                level: res.data.member_data.level,
                title: res.data.member_data.title,
                mental: res.data.member_data.mental,
                rand: res.data.member_data.rand,
              }
            });
          } else {
            //"后台：未能获取指定用户数据，未绑定手机"
            //console.log(_url+":未能获取指定用户数据，未绑定手机");
            reject({ state: -100, data: res });
          }
        },
        fail: function (res) {
          reject({ state: -101, data: "服务器有误" });
        }
      });
  });
}
function checkToken(){
  return new Promise((resolve,reject)=>{
    wx.getStorage({
      key: 'access_token',
      success: function (res) {
        //console.log('获取token成功:');
        //console.log(res);
        //resolve({ state: 1, data: res });
        if (userState != '') {
          reject(userState);
        } else {
          //token换取用户信息
          getInfoRequest('token', res.data).then((data)=>{
            userState = '';
            resolve(data);
          }).catch((err)=>{
            //token获取用户信息失败
            userState=err;
            reject(err);
          });
        }
      },
      fail: function (e) {
        //console.log("未获取到缓存里的token,需重新请求token");
        //reject({ state: 0, data: res });
        //console.log('获取token失败:');
        //console.log(e);
        if (userState!=''){
          reject(userState);
        }else{
          //code换取用户信息
          codeData.getUserCode().then((res) => {
            //console.log(res);
            getInfoRequest('code', res.data.code).then((data) => {
              userState='';
              resolve(data);
            }).catch((err) => {
              //code获取用户信息失败 未注册，未绑定手机
              userState = err;
              reject(err);
            });
          }).catch((err) => {
            userState = err;
            //获取用户code失败 可能是用户拒绝授权
            reject({ state:-140, data: err });
          })
        }
      }
    });
  })
}
module.exports.checkToken = checkToken;