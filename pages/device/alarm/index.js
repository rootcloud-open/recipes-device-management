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
    alarmSeverityLevelOption: [
      { text: '报警级别', value: 0 },
      { text: '严重', value: 1 },
      { text: '紧急', value: 2 },
      { text: '警告', value: 3 },
      { text: '一般', value: 4 },
      { text: '不确定', value: 5 }
    ],
    alarmCategoryOption: [
      { text: '报警类型', value: 0 },
    ],
    alarmClosedOption: [
      { text: '报警状态', value: 0 },
      { text: '开启', value: 1 },
      { text: '关闭', value: 2 },
    ],
    alarmSeverityLevel: 0,
    alarmCategory: 0,
    alarmClosed: 0,

    deviceInfo: {},
    deviceAlarmList: []
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
    this.getDeviceDetail(deviceInfoObj.thingId, deviceInfoObj.modelId, deviceInfoObj);
    this.getDeviceAlarm(deviceInfoObj.thingId);
  },
  // 获取设备相关的报警
  getDeviceAlarm(thingId) {
    wx.request({
      url: `${config.API_GATEWAY}/alarm-event/v1/historian/alarms/query/all?thingIds=["${thingId}"]&includeMetadata=true&limit=10`,
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
        })
      }
    });
  },
  // 获取设备详细信息
  getDeviceDetail(thingId, modelId, deviceInfo) {
    wx.request({
      url: `${config.API_GATEWAY}/thing-instance/v1/thing/thing-classes/${modelId}/instances/${thingId}`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        this.setData({
          deviceInfo: Object.assign(payload, deviceInfo)
        })
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