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
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    deviceCount: 0,
    deviceOnlineCount: 0,
    deviceAlarmCount: 0,
    deviceCountByArea: [],
    deviceCountByAlarm: [],
    loading: true
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: rootcloud,
      fields: ['authenticated']
    });
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },
  onShow() {
    if (rootcloud.authenticated) {
      this.setData({
        loading: true
      })
      Toast.loading({
        duration: 5000,
        forbidClick: true,
        message: '加载中...',
      });
      this.countDevices();
      this.countOnlineDevices();
      this.countDevicesByArea();
      this.countAlarmDevices();
    }
  },

  // 获取设备总数
  countDevices() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/device/device-instances/status/count?classId=DEVICE")	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceCount: payload && payload.length ? payload[0].count : 0
        });
      })
  },

  // 获取设备总数（在线）
  countOnlineDevices() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/device/device-instances/status/count?online=true&classId=DEVICE")	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceOnlineCount: payload && payload.length ? payload[0].count : 0
        });
      })
  },

  // 获取设备总数(按地区分组）
  countDevicesByArea() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/device/device-instances/status/count?_groupBy=%5B%22state%22%5D&classId=DEVICE")	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceCountByArea: payload && payload.length ? payload.slice(0, 5): []
        });
      })
  },
  // 获取报警统计
  countAlarmDevices() {
    let app = getApp();
    app.request("GET", "/alarm-event/v1/historian/alarms/query/count?groupByLevel=[1,2,3,4,5]")	 
      .then(res => {
        const payload = res.data.payload;
        this.setData({
          deviceCountByAlarm: payload && payload.length ? payload: []
        });
        if(payload && payload.length) {
          let alarmCount = 0;
          payload.forEach(item => {
            alarmCount += item.totalNum;
          });
          this.setData({
            deviceAlarmCount: alarmCount
          })
        }
        this.setData({
          loading: false
        })
        Toast.clear();
      })
  }
});