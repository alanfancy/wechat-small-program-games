function wxlogin(){
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
          //保存code
          //发起网络请求 请求token
          wx.request({
            url: "https://4b583376b.7tkt.com/api/get-user-info-by-code?code=" + loginRes.code,
            success: function (res) {
              //console.log(res);
              if (res.data.state == 1) {
                /*
                state：逻辑执行结果 0 失败 1 正确
                message：当 state 为 0 时 这里将说明失败原因
                member_data：当获取用户信息成功时，这里将返回用户相关信息
                    access_token    用户access-token
                    member_id    用户id
                    mobile    用户手机
                    level    用户等级
                    title    用户称号
                    mental    用户脑力值
                    rand    用户排名
                */
                wx.setStorage({
                  key: 'mobile',
                  data: res.data.member_data.mobile,
                  success: function () {
                    //resolve({ state: 1, msg: "token储存成功", data: res.data.member_data });
                    wx.setStorage({
                      key: 'access_token',
                      data: res.data.member_data.access_token,
                      success: function () {
                        resolve({ state: 1, msg: "token储存成功", data: { mobile: res.data.member_data.mobile, token: res.data.member_data.access_token } });
                      },
                      fail: function () {
                        reject({ state: -1, msg: "token储存失败" });
                      }
                    });
                  },
                  fail: function () {
                    reject({ state: -1, msg: "token储存失败" });
                  }
                });
              } else {
                reject({ state: 0, msg: "没有用户数据，用户未绑定手机" });
                //wx.navigateTo({ url: 'bindphone/bindphone' });
              }
            },
            fail: function (res) {
              console.log("code换取用户token失败，后台失联");
              reject({ state: 130, msg: "后台：code换取用户token失败，后台失联" });
            }
          });
        } else {
          reject({ state: 110, msg: "调用接口失败，无法获取用户code！" });
        }
      },
      fail: function () {
        reject({ state: 120, msg: "接口调用失败" });
      }
    });
  });
}