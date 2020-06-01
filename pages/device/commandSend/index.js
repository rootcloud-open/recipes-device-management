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
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    deviceInfo: {},
    deviceInstructionList: [],
    loading: true
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onShow() {
    this.setData({
      loading: true
    })
    Toast.loading({
      duration: 5000,
      forbidClick: true,
      message: '加载中...',
    });
    const deviceInfo = wx.getStorageSync('deviceInfo');
    const deviceInfoObj = JSON.parse(deviceInfo);
    this.setData({
      deviceInfo: deviceInfoObj
    })
    this.getDeviceModelInstruction(deviceInfoObj.modelId);
  },
  // 获取设备对应模型的指令列表
  getDeviceModelInstruction(modelId) {
    let app = getApp();
    app.request("GET", `/instruction/v1/thing/thing-models/${modelId}/instruction-templates?includeActiveNum=true`)	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceInstructionList: payload && payload.length ? payload : []
        })
        this.setData({
          loading: false
        })
        Toast.clear();
      })
  },

  goDeviceCommandSendDetail(e) {
    const deviceCommandInfo = e.currentTarget.dataset.item;
    const deviceInfo = Object.assign(this.data.deviceInfo, deviceCommandInfo);
    wx.setStorageSync('deviceCommandInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: '/pages/device/commandSend/detail'
    })
  },
})