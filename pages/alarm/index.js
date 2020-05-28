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
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
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
    this.getDeviceDetail();
    this.getDevices();
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
  // 获取设备列表
  getDevices() {
    wx.request({
      url: `${config.API_GATEWAY}/thing-instance/v1/device/device-instances?classId=DEVICE`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        const deviceThingObj = {};
        if(payload && payload.length) {
          payload.forEach(item => {
            deviceThingObj[item.thingId] = item;
          })
        }
        this.setData({
          deviceThingMap: deviceThingObj
        })
        this.setData({
          loading: false
        })
        Toast.clear();
      }
    });
  },

  goDeviceAlarmDetail(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    const deviceThingMap = e.currentTarget.dataset.item2;
    wx.setStorageSync('deviceAlarmInfo', JSON.stringify(deviceInfo));
    wx.setStorageSync('deviceThingMap', JSON.stringify(deviceThingMap));
    wx.navigateTo({
      url: `/pages/alarm/detail`
    })
  },
});