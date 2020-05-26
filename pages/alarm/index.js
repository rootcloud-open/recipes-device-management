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
import dayjs from 'dayjs';

Page({
  data: {
    deviceAlarmList: []
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onShow() {
    this.getDeviceDetail();
  },
  // 获取设备相关的报警
  getDeviceDetail() {
    wx.request({
      url: `${config.API_GATEWAY}/alarm-event/v1/historian/alarms/query/all?limit=50`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        if(payload && payload.length) {
          payload.forEach(item => {
            item.createdTime = dayjs(item.createdTime).format('YYYY/MM/DD HH:mm:ss');
          })
        }
        this.setData({
          deviceAlarmList: payload && payload.length ? payload : []
        });
      }
    });
  },

  goDeviceAlarmDetail(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    wx.setStorageSync('deviceAlarmInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: `/pages/alarm/detail`
    })
  },
});