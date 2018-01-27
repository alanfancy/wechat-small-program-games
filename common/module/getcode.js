let app=getApp();
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (loginRes) {
        //console.log("获取用户code:");
        //console.log(loginRes.code);
        if (loginRes.code) {
          //保存code
          //发起网络请求 请求token
          wx.setStorageSync('code', loginRes.code);
          resolve({ state: 1, data: { code: loginRes.code } })
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
function getUserCode() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: function (r) {
        var value = wx.getStorageSync('code');
          //console.log("value:");
          //console.log(value);
          if (value) {
            resolve({ state: 1, data: { code: value } })
          }else{
            login().then((data) => {
              if (data.state == 1) {
                resolve(data);
              }
            }).catch((err) => {
              reject(err);
            })
          }
      },
      fail: function () {
        login().then((data) => {
          if (data.state == 1) {
            resolve(data);
          }
        }).catch((err) => {
          reject(err);
        })
      }
    });
  })
}

module.exports.getUserCode = getUserCode;