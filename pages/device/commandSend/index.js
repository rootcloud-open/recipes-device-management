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

Page({
  data: {
    deviceInfo: {},
    deviceInstructionList: []
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onShow() {
    const deviceInfo = wx.getStorageSync('deviceInfo');
    const deviceInfoObj = JSON.parse(deviceInfo);
    this.setData({
      deviceInfo: deviceInfoObj
    })
    this.getDeviceModelInstruction(deviceInfoObj.modelId);
  },
  // 获取设备对应模型的指令列表
  getDeviceModelInstruction(modelId) {
    wx.request({
      url: `${config.API_GATEWAY}/instruction/v1/thing/thing-models/${modelId}/instruction-templates?includeActiveNum=true`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        this.setData({
          deviceInstructionList: payload && payload.length ? payload : []
        })
      }
    });
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