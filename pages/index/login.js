/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { rootcloud } from "../../utils/store";
import { config } from "../../utils/config";

Page({
  data: {
    user: 'develop.app@rootcloud.com',
    password: 'Zxcasd123@'
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      actions: ['login']
    });
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },
  onSubmit() {
    wx.showLoading({
      title: '登录中'
    });
    let app = getApp();
    app.request("POST", "/account-manage/v1/auth/login", {}, {
      "username": this.data.user,
      "password": this.data.password,
      "grant_type": "password",
      "client_id": `${config.CLIENT_ID}`,
      "client_secret": `${config.CLIENT_SECRET}`,
      "company": `${config.COMPANY}`
    })
      .then(res => {
        if (res.statusCode === 200) {
          this.login(res.data.access_token);
          wx.navigateBack();
          return;
        }
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        });
        wx.hideLoading();
      })
  }
});