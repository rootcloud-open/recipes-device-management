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
    value: '',
    deviceInfo: {},
    deviceAlarmDetail: {},
    deviceThingMap: {},
    alarmAckedStateMap: {
      'UNACKED': '未确认',
      'ACKED': '已确认',
      'NOTREQUIRED': '不要求确认'
    }
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onShow() {
    const deviceInfo = wx.getStorageSync('deviceAlarmInfo');
    const deviceInfoObj = JSON.parse(deviceInfo);
    const deviceThingMap = wx.getStorageSync('deviceThingMap');
    const deviceThingMapObj = JSON.parse(deviceThingMap);
    this.setData({
      deviceInfo: deviceInfoObj,
      deviceThingMap: deviceThingMapObj
    });
    this.getDeviceAlarmDetail(deviceInfoObj.id);
  },
  // 获取设备模型信息
  getDeviceAlarmDetail(alarmId) {
    wx.request({
      url: `${config.API_GATEWAY}/alarm-event/v1/historian/alarms/${alarmId}`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        if(JSON.stringify(payload) !== '{}') {
          payload.activeTime = dayjs(payload.activeTime).format('YYYY/MM/DD HH:mm:ss');
          payload.closedTime = dayjs(payload.closedTime).format('YYYY/MM/DD HH:mm:ss');
        }
        this.setData({
          deviceAlarmDetail: payload
        })
      }
    })
  }
})