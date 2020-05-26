/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { rootcloud } from "../../../utils/store";
import { config } from "../../../utils/config";
import dayjs from 'dayjs';

Page({
  data: {
    value: '',
    deviceInfo: {}
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onShow() {
    const deviceInfo = wx.getStorageSync('deviceCommandInfo');
    const deviceInfoObj = JSON.parse(deviceInfo);
    if(deviceInfoObj && Object.keys(deviceInfoObj).length) {
      deviceInfoObj.created = dayjs(deviceInfoObj.created).format('YYYY/MM/DD HH:mm:ss');
      deviceInfoObj.updated = dayjs(deviceInfoObj.updated).format('YYYY/MM/DD HH:mm:ss');
    }
    this.setData({
      deviceInfo: deviceInfoObj
    });
  }
})