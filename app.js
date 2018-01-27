//app.js
App({
  requestUrl:"https://4b583376b.7tkt.com/api/",
  //requestUrl:"http://www.ppp.com/api/",
  imgUrl:"",
  indexOf:function (arr, str){
      // 如果可以的话，调用原生方法
      if(arr && arr.indexOf) {
        return arr.indexOf(str);
      }
      var len = arr.length;
      for(var i = 0; i<len; i++){
    // 定位该元素位置
    if (arr[i] == str) {
      return i;
    }
  }
  // 数组中不存在该元素
  return -1;
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      /*
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
      */
    }
  },
  globalData:{
    userInfo:null,
    domain:"https://4b583376b.7tkt.com/"
  }
})