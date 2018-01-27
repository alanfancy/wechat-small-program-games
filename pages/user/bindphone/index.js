// pages/user/bindphone/bindphone.js
let checkToken = require('../../../common/module/checktoken');
let checkUser = require('../../../common/module/checkuserinfo');
let codeData = require("../../../common/module/getcode.js");
let obj = null;
let app=getApp();
Page({
  
    /**
     *    * 页面的初始数据common/module/checkuserinfo');
var obj = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarurl: '../../../image/face.png',//户头默认头像
    nickname: '游客',//获取的用户昵称
    userphone:'',//输入的手机号值
    usercode:'',//用户code
    validatecode:'',//验证码
    allowinpcode:false,///第一次进入时不允许直接输入验证码
    getcodebtn:'获取验证码',//验证码按钮文字
    allowclick:false,//验证码按钮是否允许点击
    sectime:null,//验证码倒计时
    sec:60,        //验证码倒计时 总时间
    tipserrno:0,
    tipscls:'success',
    tipsmsg:'请输入手机号和短信验证码',
    hastoken:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var that=this;
    checkUser.checkUserInfo().then((userdata) => {
      that.setData({
        avatarurl: userdata.avatarurl,
        nickname: userdata.nickname,
      });
    }).catch((err) => {//用户拒绝提供头像昵称等信息
      console.log(err);
    });
    
    checkToken.checkToken().then((data) => {
      //console.log("checkToken:");
      //console.log(data);
      if (data.state == 1) {
        that.setData({
          userphone: data.data.mobile,
          hastoken: true
        })
        //token已存在于session
        
      }
    }).catch((data) => {
      that.setData({
        hastoken: false
      })
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 使用本机号码
   */
  getPhoneNumber: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  } ,
  //填写手机号
  getInpPhone:function(e){
    var that=this;
    var phonenum =e.detail.value;
    if (!phonenum || phonenum.length<11){
      that.setData({
        allowclick: false
      });
      return; 
    };

    if (that.istel(phonenum)) {//验证手机号是否正确
      this.tipsMsg(0, "");
      that.setData({
        userphone: phonenum
      });
      that.setData({
        allowclick: true
      });
    } else {
      that.tipsMsg(101, "请填写正确的手机号");
      that.setData({
        allowclick: false
      });
    }
  },
  //填 写短信验证码
  getInpCode:function(e){
    var validatecode = e.detail.value;
    
    if (!validatecode || validatecode.length != 6) {
      return;
    };
    this.data.validatecode = validatecode;
    this.tipsMsg(0, "");
  },
  //点击发送短信验证码
  sendMobileMsg:function(event){
    let that=this;
    if (!this.data.userphone)return;
    if(!this.data.allowclick)return;
    this.tipsMsg(0, "");
    wx.request({
      url: app.requestUrl+"send-mobile-verify-code?mobile=" + this.data.userphone,
      success: function (res) {
        console.log(res);
        if(res.data.state==1){
          that.sendCodeTime();
        }else{
          that.tipsMsg(102, res.data.message);
        }
      },
      fail:function(err){
        that.tipsMsg(102, err);
      }
    })
  },
  //提交绑定1
  submitBind:function(){
    var that = this;
    
    if (!that.data.userphone) {
      that.tipsMsg(101, "请输入正确的手机号");
      return;
    };
    if (!that.data.validatecode){
      that.tipsMsg(101, "请输入验证码");
      return;
    };
    
    that.tipsMsg(0, "");

    codeData.getUserCode().then((data) => {
      console.log(data);
      wx.removeStorageSync('code');
      wx.request({
        url: app.requestUrl + "user-register?mobile=" + that.data.userphone + "&verify_code=" + that.data.validatecode + "&code=" + data.data.code,
        success: function (res) {
          //console.log(res);
          console.log('注册成功');
          if (res.data.state == 1) {
            wx.setStorageSync('access_token', res.data.access_token);
            wx.setStorageSync('mobile', that.data.userphone);
            that.setData({
              hastoken: true
            })
            //wx.navigateBack({ delta: 1 });
          } else {
            that.tipsMsg(102, res.data.message);
            //console.log(res.data.state+":"+res.data.message);
          }
        },fail:function(err){
          console.log(err);
        }
      });
    }).catch((err) => {
      //获取用户code失败 可能是用户拒绝授权
      reject(err);
    })
  },
  //返回
  backBind:function(){
    wx.reLaunch({
      url:"../../gamelist/index"
    });
  },
  ///发送验证码 倒计时
  sendCodeTime:function(){
    var that = this;
    that.setData({
      sectime: null,
      allowclick: false,
      allowinpcode:true,//验证码允许输入
      getcodebtn: that.data.sec + ' S'
    });
    that.data.sectime = setInterval(function () {
      if (that.data.sec > 1) {
        that.data.sec--;
        that.setData({
          getcodebtn: that.data.sec + ' S'
        });
      } else {
        clearInterval(that.data.sectime);
        that.setData({
          sectime: null,
          allowclick: true,
          sec: 5,
          getcodebtn: '获取验证码'
        });
      }
    }, 1000);
    
  },
  //手机号验证
  istel:function (tel) {
    var rtn = false;
    //移动号段
    var regtel = /^((13[4-9])|(15([0-2]|[7-9]))|(18[2|3|4|7|8])|(178)|(147))[\d]{8}$/;
    if(regtel.test(tel)) {
      rtn = true;
    }
    //电信号段
    regtel = /^((133)|(153)|(18[0|1|9])|(177))[\d]{8}$/;
    if(regtel.test(tel)) {
      rtn = true;
    }
    //联通号段
    regtel = /^((13[0-2])|(145)|(15[5-6])|(176)|(18[5-6]))[\d]{8}$/;
    if(regtel.test(tel)) {
      rtn = true;
    }
    return rtn;
  },
  //信息提示
  tipsMsg:function(errno,msg){
    var cls = errno==0?'success':'error';
      this.setData({
        tipserrno: errno,
        tipscls: cls,
        tipsmsg: msg,
      })
  }
})