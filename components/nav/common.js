const app = getApp();
Component({
  properties: {
    vTitle: {
      type: String,
      value: ""
    },
    vTitleImg: {
      type: String,
      value: ""
    },
    isSearch:{
      type: Boolean,
      value: false
    }
  },
  data: {
    haveBack: true, // 是否有返回按钮，true 有 false 没有 若从分享页进入则没有返回按钮
    statusBarHeight: 0, // 状态栏高度
    navbarHeight: 0, // 顶部导航栏高度
    navbarBtn: { // 胶囊位置信息
      height: 0,
      width: 0,
      top: 0,
      bottom: 0,
      right: 0
    },
    cusnavH: 0, //title高度
  },
  // 微信7.0.0支持wx.getMenuButtonBoundingClientRect()获得胶囊按钮高度
  attached: function () {
    if (!app.globalData.systeminfo) {
      app.globalData.systeminfo = wx.getSystemInfoSync();
    }
    if (!app.globalData.headerBtnPosi) app.globalData.headerBtnPosi = wx.getMenuButtonBoundingClientRect();
    console.log(app.globalData)
    let statusBarHeight = app.globalData.systeminfo.statusBarHeight // 状态栏高度
    let headerPosi = app.globalData.headerBtnPosi // 胶囊位置信息
    console.log(statusBarHeight)
    console.log(headerPosi)
    let btnPosi = { // 胶囊实际位置，坐标信息不是左上角原点
      height: headerPosi.height,
      width: headerPosi.width,
      top: headerPosi.top - statusBarHeight, // 胶囊top - 状态栏高度
      bottom: headerPosi.bottom - headerPosi.height - statusBarHeight, // 胶囊bottom - 胶囊height - 状态栏height （胶囊实际bottom 为距离导航栏底部的长度）
      right: app.globalData.systeminfo.windowWidth - headerPosi.right // 这里不能获取 屏幕宽度，PC端打开小程序会有BUG，要获取窗口高度 - 胶囊right
    }
    let haveBack;
    if (getCurrentPages().length <= 1) { // 当只有一个页面时，并且是从分享页进入
      haveBack = false;
    } else {
      haveBack = true;
    }
    var cusnavH = btnPosi.height + btnPosi.top + btnPosi.bottom // 导航高度
    console.log( app.globalData.systeminfo.windowWidth, headerPosi.width)
    this.setData({
      haveBack: haveBack, // 获取是否是通过分享进入的小程序
      statusBarHeight: statusBarHeight,
      navbarHeight: headerPosi.bottom + btnPosi.bottom, // 胶囊bottom + 胶囊实际bottom
      navbarBtn: btnPosi,
      cusnavH: cusnavH
    });
    //将实际nav高度传给父类页面
    this.triggerEvent('commonNavAttr',{
      height: headerPosi.bottom + btnPosi.bottom
    });
  },
  methods: {
    _goBack: function () {
      wx.navigateBack({
        delta: 1
      });
    },
    bindKeyInput:function(e){
      console.log(e.detail.value);
    }
  }
})