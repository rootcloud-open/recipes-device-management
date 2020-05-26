/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

import { observable, action } from 'mobx-miniprogram';

export const rootcloud = observable({
  authenticated: false,
  token: null,
  init() {
    let token = wx.getStorageSync('token');
    if (token) {
      let expiringDate = wx.getStorageSync('expiringDate');
      let diff = new Date().getTime() - expiringDate;
      if (diff < 0) {
        this.token = token;
        this.authenticated = true;
      }
    }
  },
  login: action(function(accessToken) {
    wx.setStorageSync('token', accessToken);
    wx.setStorageSync('expiringDate', new Date().getTime() + 3600 * 1000);
    this.authenticated = true;
    this.token = accessToken;
  }),
  logout: action(function() {
    this.token = null;
    this.authenticated = false;
    wx.clearStorageSync('token');
    wx.clearStorageSync('expiringDate');
  })
});