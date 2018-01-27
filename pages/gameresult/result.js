// pages/games/peotry/guessauthor/result.js
const checkToken = require('../../common/module/checktoken');
const wxCharts = require('../../common/module/wx-charts/wxcharts.js');
var radarChart = null;
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      usetime: "00:00",//用时
      score: 0,//总分
      continuityTotal: 0,//连续答对最大值
      dynasty: [0, 0, 0, 0, 0],////朝代统计
      dynastyTxt:'',
      sharePage:-1,
      hastoken:false,
      linkNum:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      linkNum: options.num
    });
    
    checkToken.checkToken().then((data) => {
        if (data.state == 1) {
          if (options.num >0) {
            this.setData({
              sharePage: 0,
              hastoken:true
            });
            ////有token 获取结果数据
            this.submitData(data.data.token);
          }else{
            this.setData({
              sharePage: 1,
              hastoken:true
            });
            //直接点击头像进入分享
            this.shareData(data.data.token);
          }
        }
    }).catch((err) => {
      //console.log(options.num);
        if (options.num == 1) {
          this.setData({
            sharePage: 0,
            hastoken:false
          });
          ////无token 最低等级时，直接从session获取本地数据
          this.getUserData();
        }else{
          this.setData({
            sharePage: 1,
            hastoken:false
          });
          ///无token 直接点击头像进入分享
          this.shareData(null);
        }
    });
  },
  ////无token 最低等级时，直接从session获取本地数据
  getUserData:function(){
      let that=this;
      //console.log(wx.getStorageSync('usetime'));
      let usetime = wx.getStorageSync('usetime');
      let score = wx.getStorageSync('score');
      let continuitytotal = wx.getStorageSync('continuitytotal');
      let dynasty = wx.getStorageSync('dynasty');
      //let rightTotal = wx.getStorageSync('rightTotalNum');
      //let wrongTotal = wx.getStorageSync('wrongTotalNum');
      that.setData({
        usetime: usetime,
        score: score,
        continuityTotal: continuitytotal,
        dynasty: dynasty,
        //rightTotal: rightTotal,
        //wrongTotal: wrongTotal
      });
      //console.log("r2用时:" + that.data.usetime);//用时
      //console.log("r2总分:" + that.data.score);//总分
      //console.log("r2朝代统计:" + that.data.dynasty);//朝代统计
      //console.log("continuitytotal:" + continuitytotal);//连续答对
      //console.log("r2连续答对:" + that.data.continuityTotal);//连续答对
      that.chartsDraw(that.data.dynasty);
  },
  ////有token 获取结果数据
  submitData:function(token){
    
    let that = this;
    wx.getStorage({
      key: 'myanswer',
      success: function (m) {
        let _d=JSON.stringify(m.data);
        //console.log("_d:");
        //console.log(_d);
        //通知后台 结果答题,并请求返回结果
        wx.request({
          url: app.requestUrl+"user-submit-answer?access_token=" + token + "&answer_data=" + _d ,
          success: function (res) {
            //console.log("result:");
              //console.log(res);
              if(res.data.state==1){
                //时间转换
                let _timeData = res.data.answer_result.use_time;
                let sec = _timeData%60;
                let min = Math.floor(_timeData/60);
                sec = sec > 10 ? sec : "0" + sec;
                min=min>10?min:"0"+min;
                let _time=min+":"+sec;
                //朝代统计 
                let dynastyData = res.data.answer_result.dynasty;
                let _dynasty=[];
                for (let i in dynastyData){
                  let dynastyPct = dynastyData[i].right_num > 0 ? (dynastyData[i].right_num / dynastyData[i].question_num).toFixed(2) *100 : 0;
                  _dynasty.push(dynastyPct);
                }
                //console.log("res.data:");
                //console.log(res.data);
                that.setData({
                  usetime: _time,
                  score: res.data.answer_result.score,
                  continuityTotal: res.data.answer_result.continue_num,
                  dynasty: _dynasty
                });
                that.chartsDraw(that.data.dynasty);
              }
          }
        })
      }
    });
  },
  shareData:function(token){
    let that=this;
    //console.log(token);
    if (token){ 
      wx.request({
        url: app.requestUrl+"get-user-dynasty?access_token=" + token,
        success:function(res){
          //console.log(res.data);
          
            if(res.data.state==1){
              //朝代统计 
              let dynastyData = res.data.dynasty;
              let _dynasty = [];
              for (let i in dynastyData) {
                let dynastyPct = dynastyData[i].right_num > 0 ? (dynastyData[i].right_num / dynastyData[i].question_num).toFixed(2) * 100 : 0;
                _dynasty.push(dynastyPct);
              }
              //console.log(_dynasty);
              that.setData({
                dynasty: _dynasty
              });
              that.chartsDraw(that.data.dynasty);
            }
            
        }
      })
    }else{
      this.setData({
        dynasty: [0, 0, 0, 0, 0]
      });
      this.chartsDraw(this.data.dynasty);
    }
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  maxDynasty:function(arr){
    return new Promise((resolve,reject)=>{
      let n = 0;
      let max = arr[0];
      
      for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
          n=i;
          max = arr[i];
        }
      }
      resolve({num:n,max:max})
    })
  },
  chartsDraw: function (dynastyArr){
    this.maxDynasty(dynastyArr).then((data)=>{
        //console.log(data);
        let dynastyTxt='';
        switch(data.num){
          case 0:
            dynastyTxt="唐"
            break;
          case 1:
            dynastyTxt = "宋"
            break;
          case 2:
            dynastyTxt = "元"
            break;
          case 3:
            dynastyTxt = "明"
            break;
          case 4:
            dynastyTxt = "清"
            break;
        }
        this.setData({
          dynastyTxt: dynastyTxt
        })
    });
    let windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    radarChart = new wxCharts({
      canvasId: 'radarCanvas',
      type: 'radar',
      categories: ['唐', '宋', '元', '明', '清'],
      legend: false,
      series: [{
        name: '成交量1',
        data: dynastyArr
      }],
      width: windowWidth,
      height: 200,
      extra: {
        radar: {
          max: 100
        }
      }
    });
  },
  touchHandler: function (e) {
    //console.log(radarChart.getCurrentDataIndex(e));
  },
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
      imageUrl: '../../image/share2.jpg',
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
  playAgainHandler:function(event){
    wx.reLaunch({
      //url: "../peotry/index?num=" + this.data.linkNum
      url: "../gamelist/index"
    });
    
  },
  playMore:function(e){
    wx.reLaunch({
      url: '../user/bindphone/index'
    });
  },
  ///保存图片
  saveImagesHandler:function(){
    
    const ctx = wx.createCanvasContext('radarCanvas');

    //ctx.save();
    //ctx.drawImage("../../../../image/page/sharebg.jpg", 0, 0,300,250);
    
    ctx.setFontSize(20);
    ctx.fillText('你适合穿越去唐代哦~', 70, 210);
    ctx.setFontSize(16);
    ctx.fillText('（测试越多，结果越准确哟）', 60, 230);
    ctx.save();
    ctx.drawImage("../../../../image/page/sharebg2.png", 0, 270, 300, 111);
    ctx.draw();
    wx.canvasToTempFilePath({
      canvasId: 'radarCanvas',
      fileType:"jpg",
      success: function (res) {
        

        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            console.log(res);
          }
        })
      }
    })
    /*
    
    */
  },
})