// pages/games/peotry/guessauthor/index.js
const checkToken = require('../../common/module/checktoken');
let app = getApp();
Page({
  data:{
    linkNum:0,
   //题目数据
    questionData: [],
    usertoken:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.num);
    this.setData({
      linkNum: options.num
    });
   
      //console.log('111');
      checkToken.checkToken().then((data) => {
        
          //token已存在于session
          //console.log("token");
          //console.log(data);
          this.setData({
            usertoken:data.data.token
          })
          //有token时,需要传入token获取,第三个参数为获取的题目数量
          this.requestTit(options.num, data.data.token);
        
      }).catch((err) => {
        /*
        if (data.state == 0) {
          //未能获取指定用户数据 未绑定手机
          //wx.redirectTo({ url: '../../user/index' });
        } else {
          console.log("其它错误");//"token储存失败"
          console.log(data);
        }
        */
        //console.log(err);
        if (options.num == 1) {
           //没有token时,传0  ,第三个参数为获取的题目数量
          this.requestTit(options.num, 0);
        }
      });
      
  },
  //请求题目数据
  requestTit: function (d,t,n,o){
    let that=this;
    let _url ='';
    //console.log("t:"+t);
    if (d) _url+="?difficulty="+ d;///难度 
    if (t) _url +="&access_token="+t;//token
    if (n) _url +="&question_num="+n;//题目数量
    if (o) _url += "&is_old=" + o;//是否需要获取用户已有的题目数据
    
    ///获取题目数据
    wx.request({
      url: app.requestUrl+"get-question-data" + _url,
      success: function (res) {
        //console.log("请求：");
        //console.log(res);
        that.getContentData(res.data);
      },
      fail: function (err) {
        console.log("err:");
        console.log(err);
      }
    })
  },
  //设置组件数据
  getContentData:function(data){
    //console.log(data);
    if(data.state==1){
      ////题目
      //console.log("question_data:");
      //console.log(data);
      this.setData({
        questionData: data.question_data
      })
    }
  },
  overEvent:function(e){
      let that=this;
      wx.redirectTo({
        url: "../gameresult/result?num=" + that.data.linkNum,
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
  
})