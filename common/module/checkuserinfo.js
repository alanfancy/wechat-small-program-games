//检查用户头像
function checkAvatarUrl(){
  return new Promise((resolve,reject)=>{
    wx.getStorage({
      key: 'avatarUrl',//获取头像
      success: function (_d) {
        resolve({state:1,data:_d.data});
      },
      fail: function (_d) {
        reject({ state: 0,  _d});
      }
    });
  })
}
//检查用户昵称
function checkNickName(){
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: 'nickName',//获取头像
      success: function (_d) {
        resolve({ state: 1, data: _d.data });
      },
      fail: function (_d) {
        reject({ state: 0,  _d });
      }
    });
  })
}
///获取用户头像和昵称
function getUserBaseInfo(){
  return new Promise((resolve,reject)=>{
      wx.getUserInfo({
        withCredentials: true,
        success: function (res_user) {
          var userInfo = res_user.userInfo;
          wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
          wx.setStorageSync('nickName', userInfo.nickName);
          resolve({ state: 1, data: { avatarurl: userInfo.avatarUrl, nickname: userInfo.nickName } });
        },
        fail:function(err){
          //没有用户数据
          //reject({ state: -120, data: err });
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
            success: function (res) {
              if (res.confirm) {
                //调起客户端小程序设置界面，返回用户设置的操作结果。
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                      wx.getUserInfo({
                        success: function (res_user) {
                          var userInfo = res_user.userInfo;
                          wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
                          wx.setStorageSync('nickName', userInfo.nickName);
                          resolve({ state: 1, data: { avatarurl: userInfo.avatarUrl, nickname: userInfo.nickName } });
                        }
                      })
                    }
                  }, fail: function (res) {
                    reject({ state: -120, data: res });
                  }
                })

              }
            }
          })
        }
      });
  })
}

//用户头像和昵称需同时存在
function checkUserInfo(){
  return new Promise((resolve, reject) => {
          ///获取用户头像和昵称 需要微信提供
          Promise.all([checkAvatarUrl(), checkNickName()]).then((_d) => {
            resolve({ avatarurl: _d[0].data, nickname: _d[1].data});
          }).catch((err) => {
            getUserBaseInfo().then((_udata) => {
              resolve({ avatarurl: _udata.data.avatarurl, nickname: _udata.data.nickname });
            }).catch((e) => {
              reject({ state: 0,data: e });
            })
          });
  })
}
module.exports.checkUserInfo = checkUserInfo;