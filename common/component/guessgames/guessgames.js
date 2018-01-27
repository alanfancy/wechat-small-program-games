let app=getApp();
let allowSubmit=true;//避免重复提交
let bgmusic = 'http://qitian-ui-develop.b0.upaiyun.com/wechat/little_program/music/dr.mp3';
const innerAudioContext = wx.createInnerAudioContext();
let bgmusicCtr=null;
let i = 1;
Component({
  properties: {
    ///外部传入的本组所有题目
    reqData: {
      type: Object,
      value: []
    },
    userToken:{
      type:String,
      value:0
    },
    linkNum:{
      type:String,
      value:0
    }
  },
  data: {
    // 这里是一些组件内部数据
    selecNum:'-1',//我选中的答案下标 用于设置action样式
    totalAnswer: [],//我的本组所有答案 通用
    hasDo: false,//当前题目是否已作答 通用
    check: false,///当前题目对错检查 true false
    autoPut:true,//选择填空时 是否顺序自动填入  
    thisNum: -1,//当前题目在本组题目里的顺序号码 通用
    rightNum:-1,//正确答案序号
    rightText:'',//正确答案
    topics: {//当前题目 通用
      type: JSON,
      value: {}
    },
    row:0,
    column:0,
    timeOver:false,//时间结束
    topicsAnswer: [],//当前答案  第四题上下句专用
    usetime: "00:00",//倒计时结果
    totalMin: 5,//倒计时设定 分
    totalSec: 0,//倒计时设定 秒
    topicScore: 0,//得分
    timeObj:null,//时间计时
    dynasty: [0, 0, 0, 0, 0],//朝代记录  题目朝代（1=>唐代 2=>宋代 3=>元代 4=>明代 5=>清代）
    continuity:0,//连续正确数
    continuityTotal:0,//连续正确数最大值
    rightTotalNum:0,//总答对数
    wrongTotalNum:0,//总答错数
    bgMusicAnimationData: {},//背景音乐播放动画
    flyTextAnimation:false,//加分动画
    bgmusicUrl:'',//背景音乐地址
    isPlay:0,//背景音乐是否在播放
  },
  methods: {
    musicControlHandler:function(event){
      let that=this;
      let isplay=event.currentTarget.dataset.isplay;
      console.log(isplay);
      if(isplay){
        innerAudioContext.pause();
        //that.bgMusicClearInterval();
        this.setData({
          isPlay: false
        });
      }else{
        innerAudioContext.play();
        //that.bgMusicAnimation();
        this.setData({
          isPlay: true
        });
      }
    },
    bgMusicPlay:function(){
      let that=this;
      
      innerAudioContext.autoplay = true;
      innerAudioContext.src = bgmusic;
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
        //that.bgMusicAnimation();
        that.setData({
          isPlay: true
        });
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      
    },
    /*
    bgMusicAnimation:function(){
      let that=this;
      
      let animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease-in-out',
      })
      let animationCloudData = wx.createAnimation({
        duration: 1000, // 默认为400     动画持续时间，单位ms
        timingFunction: 'ease-in-out',
        //transformOrigin: '4px 91px'
      });
      this.animation = animation;
      animationCloudData.scale(1.1).step({ duration: 500 }).scale(1).step({ duration: 200 }).scale(1.1).step({ duration: 500 }).scale(1).step({ duration: 200 });
      //animation.rotate(360).step();
      
      this.setData({
        bgMusicAnimationData: animationCloudData.export()
      });
      bgmusicCtr = setInterval(function () {
        i++;
        //动画的脚本定义必须每次都重新生成，不能放在循环外
        animationCloudData.scale(1.1).step({ duration: 500 }).scale(1).step({ duration: 200 }).scale(1.1).step({ duration: 500 }).scale(1).step({ duration: 200 });
        // 更新数据
        that.setData({
          // 导出动画示例
          //animationData: animationData.export(),
          bgMusicAnimationData: animationCloudData.export(),
        });
      }.bind(that), 5000);
    },
    bgMusicClearInterval: function (){
      clearInterval(bgmusicCtr);
    },
    */
    rowEvent:function(num,length){
      let _row=Math.ceil(num/length);
      this.setData({
        row: _row
      })
    },
    columnEvent: function (length){
      this.setData({
        column: length
      })
    },
    //游戏结束 跳转前的事件处理
    gameOverEvent:function(){
      var myEventDetail = {
        name:'wyl',
        pei:'nmb',
      }; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('overevent', myEventDetail, myEventOption);
    },
    //对题目诗句进行处理
    setSubjectData: function (data,n) {
      if (data[n].question_type < 5 || data[n].question_type==6){
          //去除诗词结尾的句号，并以逗号换行
        data[n].question_sentence = data[n].question_sentence.replace(/。/,'').split('，');
        }
        this.setData({
          hasDo: false,
          selecNum: '-1',
          topics: data[n]
        });
        //当题目类型为选字填空时，计算行列数目
        if (this.data.topics.question_type>=4){
          let num = this.data.topics.select_answer.length;
          let length = this.data.topics.sentence_length;
          this.rowEvent(num, length); this.columnEvent(length);
        }
        
    },
    //古诗识别 点击选择后 对文字的处理
    wordClickHandler: function (event) {
      let ind = event.currentTarget.dataset.index;
      //console.log("index"+ind);
      this.setData({
        selecNum: ind,
        autoPut: false
      })
    },
    gameover:function(){
      let that=this;
      allowSubmit=false;
      clearInterval(this.data.timeObj);
      let dynastyString = this.data.dynasty.toString();//数组转成字符串储存
      //缓存结果数据
      wx.setStorageSync('usetime', that.data.usetime);
      wx.setStorageSync('myanswer', that.data.totalAnswer);
      wx.setStorageSync('score', that.data.topicScore);
      wx.setStorageSync('dynasty', that.data.dynasty);
      wx.setStorageSync('continuitytotal', that.data.continuityTotal);
      wx.setStorageSync('righttotal', that.data.rightTotalNum);
      wx.setStorageSync('wrongtotal', that.data.wrongTotalNum);
      that.gameOverEvent();
    },
    //题目跳转程序 跳转下一题 判断是否结束，计算结果并储存
    timeJump: function () {
      //console.log(this.data.reqData);
      let that=this;
      if (this.data.reqData.length<1)return;
      let num = that.data.thisNum;
      //时间结束后 自动跳转下一题
      if (num >= this.data.reqData.length * 1-1  || this.data.timeOver){
        //最后一题，直接结束
        if (allowSubmit){
          this.gameover();
        }else{
          console.log('已经结束');
        }
      }else{
        num++;//下一题编号
        allowSubmit=true;
        //下一题数据重置
        this.setData({
          thisNum: num,//当前题目编号
          hasDo: false,//是否已做
          checkImg: "",//对错图标
          selecNum: '-1',//选中的方格或答案下标
          topicsAnswer:[],//当前题目我的答案
          autoPut: true,////方格允许自动填充
          flyTextAnimation: false,//加分动画
          rightNum: -1,//正确答案序号
          rightText: '',//正确答案
        });
        this.setSubjectData(this.data.reqData, this.data.thisNum);
      };
    },
    //古诗猜作者 古诗猜标题 古诗猜朝代  古诗错别字识别 点击选择事件
    answerSelectHandler: function (event) {
      if (this.data.hasDo)return;
      let that=this;
      let answer=event.currentTarget.dataset.text;//答案文本值
      let index = event.currentTarget.dataset.index;//答案下标
      let answerArr = this.data.totalAnswer;///本组题目所选答案
      let right_answer = this.data.topics.right_answer;//正确答案
      let select_answer = this.data.topics.select_answer;//本题所有答案选项
      answerArr.push(answer);//记录每题的答案
      let rn = app.indexOf(select_answer, right_answer);//取正确答案的编号位置
      
      that.setData({
        hasDo:true,
        rightNum: rn,//正确答案序号
        //rightText: right_answer,//正确答案
        selecNum: index,//所选择的题目下标
        totalAnswer: answerArr//
      });
      that.answerCheck(answer);//答案核对 参数记录
      that.answerEndDlg();//答案核对结束后 进行弹窗提示转入下一题 
    },
    //古诗上下句 古诗识别 点击选择事件
    answerWordHandler: function (event) {
      //console.log("000");
      if (this.data.hasDo) return;
      
      //if (this.data.topicsAnswer.length >= this.data.topics.sentence_length)return;
      //console.log("111");
      let that = this;
      let answer = event.currentTarget.dataset.text;//答案文本值
      let index = event.currentTarget.dataset.index;//答案下标
      let answerArr = that.data.topicsAnswer;///当前题目所选答案
      //选中指定空格时，答案填到指定处

      //console.log("selecNum:"+that.data.selecNum);
      
      //否则，按顺序填写
      if(that.data.autoPut){
        answerArr.push(answer);
      }else{
        if (that.data.selecNum >= 0) {
          answerArr[that.data.selecNum] = answer;
          that.setData({
            autoPut: false
          });
        } else {
          return false;
        }
      }
      that.setData({
        selecNum: '-1',
        topicsAnswer: answerArr///记录当前选择的答案
      });
      //判断诗句选择字数是否完成
      //console.log("用户选择："+this.data.topicsAnswer.length);
      //console.log("答案总数：" +this.data.topics.sentence_length);
      if (that.data.topicsAnswer.length == that.data.topics.sentence_length){
        
        let answerArr = that.data.totalAnswer;//获取用户所有的答题答案
        let _d = that.data.topicsAnswer;//获取用户当前题目的答题答案


        let str="";
        for(let i=0;i<_d.length;i++){
          //console.log("i:"+_d[i]);
          if(_d[i]){
            str += _d[i];
          }else{
            return false; 
          };
          
        }
        answerArr.push(str);//记录每题的答案
        that.setData({
          hasDo: true,
          totalAnswer: answerArr
        });
        //答案对比分析
        that.answerCheck(str);//答案核对 参数记录
        that.answerEndDlg();//答案核对结束后 进行弹窗提示转入下一题 
      };
    },
    //古诗错别字识别 未有引用
    /*
    answerJudgeHandler:function(event){
      if (this.data.hasDo) return;
      let that=this;
      let answer = event.currentTarget.dataset.text;//答案文本值
      let index = event.currentTarget.dataset.index;//答案下标
      let answerArr = this.data.totalAnswer;//获取用户所有的答题答案
      answerArr.push(answer);//记录每题的答案
      //更新数据
      that.setData({
        hasDo: true,
        selecNum: index,//所选择的题目下标
        totalAnswer: answerArr
      });
      that.answerCheck(answer);//答案核对 参数记录
      return;
      that.answerEndDlg();//答案核对结束后 进行弹窗提示转入下一题 
    },
    */
    //答案核对 参数记录
    answerCheck: function (answer){
      let that=this;
      let right_answer = this.data.topics.right_answer;//正确答案
      console.log(answer);
      console.log(right_answer);
      console.log(answer == right_answer);
      if (answer == right_answer) {
        console.log("123");
        //各朝代答对数量记录
        let _dynasty = that.data.topics.question_dynasty;
        let _dynastyArr = that.data.dynasty;
        _dynastyArr[_dynasty - 1] += 10;
        //答对加分
        let score = that.data.topicScore;
        score = score * 1 + 10;//记分
        //连续正确数
        let continuity = that.data.continuity;
        continuity = continuity * 1 + 1;//记录连续正数
        //记录正确数
        let rightTotal = that.data.rightTotalNum;
        rightTotal++;
        //连续最高正确数记录
        let continuityTotal = that.data.continuityTotal;
        if (continuity > continuityTotal) {
          continuityTotal = continuity;//记录连续正确数最大值
        }
        
        that.setData({
          check: true,
          flyTextAnimation:true,
          topicScore: score,
          dynasty: _dynastyArr,
          continuity: continuity,
          continuityTotal: continuityTotal,
          rightTotalNum: rightTotal
        });
        //console.log('continuity:' + continuity);
        //console.log('continuityTotal:' + continuityTotal);
      } else {
        //答错显示
        let continuity = that.data.continuity;
        continuity = 0;//连续正确数量清零
        //记录正确数
        let wrongTotal = that.data.wrongTotalNum;
        wrongTotal++;
        that.setData({
          check: false,
          rightText: right_answer,//正确答案
          continuity: continuity,
          wrongTotalNum:wrongTotal
        });
        //console.log("失败");
      }
    },
    //答案核对结束后 进行弹窗提示转入下一题 
    answerEndDlg:function(){
      let that=this;
      //判断是否需要弹出切换提示
      let num = this.data.thisNum;
      if (num < this.data.reqData.length - 1) {
        //弹出提示 1秒后自动跳转
        wx.showLoading({
          title: '2秒后自动切换下一题',
          mask: true
        });
        //1秒后自动关闭弹窗并跳转
        setTimeout(function () {
          wx.hideLoading();
          that.timeJump();
        }, 2000);
      } else {
        wx.showLoading({
          title: '正在预测...',
          mask: true
        });
        setTimeout(function () {
          that.timeJump();
        }, 1000);
      }
    },
    //长按文件框 删除事件
    wordDeleHandler:function(event){
        //console.log(event.currentTarget.dataset.index);
        let num = event.currentTarget.dataset.index;
        let answerArr = this.data.topicsAnswer;
        answerArr[num]='';
        this.setData({
          topicsAnswer: answerArr,
          autoPut:false
        })
    },
    ///小于10的时间前加零
    setTime: function (m, s) {
      return new Promise((resolve, reject) => {
        m = m * 1 < 1 ? '0' : m;
        s = s * 1 < 1 ? '0' : s;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        let time = m + ":" + s;
        resolve(time);
      })
    },
    //计时器
    userTime: function () {
      let that = this;
      return new Promise((resolve, reject) => {
        //let timed = that.data.setTimeObj.split(":");
        let m = 0, s = 0;
        that.setTime(m, s).then((t) => {
          that.setData({
            usetime: t
          })
        });
        that.data.timeObj=setInterval(function () {
          if (s >=60) {
            if (m >=60) {
              clearInterval(that.data.timeObj);
            } else {
              m++;
              s=0;
            }
          } else {
            s++;
          }
          if (m >= that.data.totalMin) {
            if (s >= that.data.totalSec) {
              clearInterval(that.data.timeObj);
                that.setData({
                  timeOver: true
                });
                reject('TimeOver');
            }
          }
          that.setTime( m, s).then((t) => {
            that.setData({
              usetime: t
            })
          });
        }, 1000);
      })
    },
  },
  ready:function(){
    let that = this;
    
    wx.showModal({
      title: '准备好了吗？',
      content: '点击确定开始答题',
      success: function (res) {
        //console.log(res);
        if (res.confirm) {
          //console.log("reqData:");
          //console.log(that.data.reqData);
          that.bgMusicPlay(); 
          wx.showLoading({
            title: '加载中',
          })

          setTimeout(function () {
            wx.hideLoading();
            if (that.data.reqData.length > 0) {
              //题目难度
              //console.log(that.data.userToken);
              //console.log(that.data.userToken !=0);
              if (that.data.userToken != 0) {
                //获取token
                //console.log(that.data.userToken);
                //通知后台 开始做作业
                wx.request({
                  url: app.requestUrl + "user-start-answer?access_token=" + that.data.userToken,
                  success: function (res) {
                    //console.log(res);
                    if (res.data.state == 1) {
                      //开始计时
                      that.userTime().then((t) => {
                      }).catch((d) => {
                        //计时结束时执行
                        clearInterval(that.data.timeObj);
                        if (allowSubmit){
                          wx.showLoading({
                            title: '时间结束...',
                            mask: true
                          });
                          setTimeout(function () {
                            that.timeJump();
                          }, 1000);
                        }
                        
                      });
                      //题目数据初始化 默认读取第一组题目
                      that.timeJump();
                    }
                  },
                  fail: function (err) {
                    console.log("服务器炸了？")
                  }
                })
              } else {
                //开始计时
                if (that.data.linkNum == 1) {
                  //console.log (that.data.topics.length);
                  that.userTime().then((t) => {
                    console.log(t);
                  }).catch((d) => {
                    that.timeJump();
                  })
                  that.timeJump();//题目数据初始化 默认读取第一组题目
                }
              }
            } else {
              wx.showModal({
                title: '抱歉，出错了',
                content: '没有获得题目数据',
                complete: function (res) {
                  //wx.navigateBack()
                }
              })
            };
          }, 2000);
        }else{
          //res.cancel//console.log('用户点击取消')
          //用户点击蒙层或取消
          wx.reLaunch({
            url: "../gamelist/index",
          });
        }
      }
    })
  },
  detached:function(){
    //卸载时执行
    clearInterval(this.data.timeObj);
  }
})