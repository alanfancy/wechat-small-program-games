// pages/games/peotry/index.js
const checkToken = require('../../common/module/checktoken');
const checkUser = require('../../common/module/checkuserinfo');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarurl: '../../image/face.png',//户头默认头像
    nickname: '游客',//获取的用户昵称
    hastoken:false,//是否有token(是否绑定手机)
    level:'0',//等级
    title: '路人',//头衔
    mental: '0',//脑力值 1324525
    rand: '0',//排名 354643
  },
  onPullDownRefresh: function () {
    console.log('233333333');
    wx.showNavigationBarLoading();
    wx.stopPullDownRefresh();
    let that = this;
    wx.clearStorageSync();
    checkUser.checkUserInfo().then((userdata) => {
      that.setData({
        avatarurl: userdata.avatarurl,
        nickname: userdata.nickname,
      });
    }).catch((err) => {//用户拒绝提供头像昵称等信息
      console.log(err);
    });
    checkToken.checkToken().then((data) => {
      console.log("checkToken:");
      console.log(data);
      if (data.state == 1) {
        that.setData({
          hastoken: true,
          level: data.data.level,//等级
          title: data.data.title,//头衔
          mental: data.data.mental,//脑力值 1324525
          rand: data.data.rand,//排名 354643
        });

      }
    }).catch((err) => {
      that.setData({
        hastoken: false,
        level: '0',//等级
        title: '路人',//头衔
        mental: '0',//脑力值 1324525
        rand: '0',//排名 354643
      });
    });;

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.clearStorageSync();
    //token已存在于session
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
            hastoken: true,
            level: data.data.level,//等级
            title: data.data.title,//头衔
            mental: data.data.mental,//脑力值 1324525
            rand: data.data.rand,//排名 354643
          });
          
        }
      }).catch((err) => {
        that.setData({
          hastoken: false,
          level: '0',//等级
          title: '路人',//头衔
          mental: '0',//脑力值 1324525
          rand: '0',//排名 354643
        });
      });
    
    //this.onlinesRandoms();
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
      return {
        title: '如果能穿越，你能去哪里？',
        path: '/pages/gamelist/index',
        imageUrl:'../../image/share2.jpg',
        success: function (res) {
          // 转发成功
          console.log(res);
        },
        fail: function (res) {
          // 转发失败
          console.log(res);
        }
      }
  },
  goStartHandler:function(event){
    //题目难度跳转页面
    //guessauthor/index
    let linkNum = event.currentTarget.dataset.linknum;
    if (!linkNum)return;
    if (linkNum>1){
      if (!this.data.hastoken){
        wx.showModal({
          title: '温馨提示',
          content: '绑定手机即可使用高级功能，点击确定进入绑定页面',
          success: function (res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '../user/bindphone/index',
              });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        });
        return;
      };
    }
    
    wx.redirectTo({ url: "../peotry/index?num=" + linkNum});
  },
  shareCenterHandler: function (event) {
    //点击头像跳转至分享页面
    //wx.navigateTo({ url: "guessauthor/result?num=0"});
  },
})