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
    user: '',
    password: ''
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
    wx.request({
      url: `${config.API_GATEWAY}/account-manage/v1/auth/login`,
      method: 'POST',
      data: {
        "username": this.data.user,
        "password": this.data.password,
        "grant_type": "password",
        "client_id": `${config.CLIENT_ID}`,
        "client_secret": `${config.CLIENT_SECRET}`,
        "company": `${config.COMPANY}`
      },
      dataType: 'json',
      success: (res) => {
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
      },
      complete() {
        wx.hideLoading();
      }
    });
  }
});