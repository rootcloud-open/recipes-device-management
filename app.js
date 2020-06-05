import { rootcloud } from "./utils/store";
import { config } from "./utils/config";

App({
  onLaunch() {
    //设置默认分享
    this.globalData.shareData = {
      title: "根云设备管理示例应用"
    }

    rootcloud.init();
    this.checkUpdateVersion();
  },
  request(method, url, header = {}, data = {}) {
    let token = rootcloud.token;
    if (token) {
      header["Authorization"] = 'Bearer ' + token;
    }
    return new Promise((resolve, reject) => {
      wx.request({
        method, 
        url: config.API_GATEWAY + url,
        header,
        data,
        success(res) {
          // 请求成功
          if (res.statusCode === 200) {
            resolve(res)
          }
          // 请求成功无响应体
          else if (res.statusCode === 204) {
            resolve(res)
          }
          // 未认证
          else if (res.statusCode === 401) {
            /* 可做一些错误提示，或者直接跳转至登录页面等 */
            setTimeout(() => {
              wx.navigateTo({url: '/pages/index/login'});
            }, 500);
            reject(res);
          }
          else if (res.statusCode == 400) {
          /* 可做一些错误提示*/
            reject(res)
          }
          else if (res.statuCode === 403) {
            /* 无权限错误提示*/
            reject(res)
          }
        },
        fail(err) {
          /* 可做一些全局错误提示，如网络错误等 */
          reject(err)
        }
      })
    })
  },

  checkUpdateVersion() {
    //判断微信版本是否兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate);
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          }
        })
      })
    } else {
      //TODO 此时微信版本太低（一般而言版本都是支持的）
      wx.showModal({
        title: '溫馨提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  globalData: {
    //默认分享文案
    shareData: {},
    qrCodeScene: false, //二维码扫码进入传参
    systeminfo: false,   //系统信息
    headerBtnPosi: false,  //头部菜单高度
  }
});