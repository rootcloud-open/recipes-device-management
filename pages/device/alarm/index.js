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
import Toast from '@vant/weapp/toast/toast';

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
    deviceAlarmList: [],
    deviceThingMap: {},
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
    const deviceThingMapObj = {
      [deviceInfoObj.thingId]: deviceInfoObj
    }
    this.setData({
      deviceInfo: deviceInfoObj,
      deviceThingMap: deviceThingMapObj
    })
    this.getDeviceDetail(deviceInfoObj.thingId, deviceInfoObj.modelId, deviceInfoObj);
    this.getDeviceAlarm(deviceInfoObj.thingId);
  },
  // 获取设备相关的报警
  getDeviceAlarm(thingId) {
    let app = getApp();
    app.request("GET", `/alarm-event/v1/historian/alarms/query/all?thingIds=["${thingId}"]&includeMetadata=true&limit=50`)	 
      .then(res => {
        const payload = res.data.payload;
        if(payload && payload.length) {
          payload.forEach(item => {
            item.createdTime = dayjs(item.createdTime).format('YYYY/MM/DD HH:mm:ss');
          })
        }
        this.setData({
          deviceAlarmList: payload && payload.length ? payload.reverse() : []
        })
      })
  },
  // 获取设备详细信息
  getDeviceDetail(thingId, modelId, deviceInfo) {
    let app = getApp();
    app.request("GET", `/thing-instance/v1/thing/thing-classes/${modelId}/instances/${thingId}`)	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceInfo: Object.assign(payload, deviceInfo)
        })
        this.setData({
          loading: false
        })
        Toast.clear();
      })
  },

  goDeviceAlarmDetail(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    const deviceThingMap = this.data.deviceThingMap;
    wx.setStorageSync('deviceThingMap', JSON.stringify(deviceThingMap));
    wx.setStorageSync('deviceAlarmInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: `/pages/alarm/detail`
    })
  },
});