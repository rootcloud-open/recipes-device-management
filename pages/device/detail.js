/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { rootcloud } from "../../utils/store";
import jwtDecode from 'jwt-decode';
import Toast from '@vant/weapp/toast/toast';
import dayjs from 'dayjs';

Page({
  data: {
    userInfo: {},
    deviceDetail: {},
    deviceRealtimeData: {},
    deviceRealtimeDataLength: 0,
    loading: true,
    devicePropMap: {
      '__location__': '当前位置',
      '__online__': '在线状态',
      '__workingStatus__': '设备工作状态',
      'WaterTemperature': '水温',
      'RotateSpeed': '转速',
      'OilPressure': '油压',
      'OilTemperature': '油温',
      'Speed': '速度',
      'Voltage': '电压'
    }
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
    this.getDeviceDetail(deviceInfoObj.thingId, deviceInfoObj.modelId, deviceInfoObj);
    this.getDeviceModel(deviceInfoObj.modelId);
    this.getDeviceRealtimeData(deviceInfoObj.thingId, deviceInfoObj.modelId);
    const token = rootcloud.token;
    if(token) {
      const userInfo = jwtDecode(token);
      this.setData({
        userInfo
      });
      this.getUserInfo();
    }
  },
  // 获取设备详细信息
  getDeviceDetail(thingId, modelId, deviceInfo) {
    let app = getApp();
    app.request("GET", `/thing-instance/v1/thing/thing-classes/${modelId}/instances/${thingId}`)	 
      .then(res => {
        const payload = res.data.payload;
        if(payload && Object.keys(payload).length) {
          payload.created = dayjs(payload.created.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
        }
        this.setData({
          deviceDetail: Object.assign(payload, deviceInfo)
        });
      })
  },
  // 获取设备模型信息
  getDeviceModel(modelId) {
    let app = getApp();
    app.request("GET", `/thing-model/v1/thing/thing-classes/${modelId}?thingType=device&_resolve=true`)	 
      .then(res => {
        const payload = res.data.payload;
        if(Object.keys(payload).length) {
          payload.created = dayjs(payload.created.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
        }
        this.setData({
          deviceDetail: Object.assign(this.data.deviceDetail, payload)
        })
      })
  },
  // 获取设备的实时工况数据
  getDeviceRealtimeData(thingId, modelId) {
    let app = getApp();
    app.request("GET", `/realtime-manage/v1/realtime/models/${modelId}/things/${thingId}`)	 
      .then(res => {
        const payload = res.data.payload;
        if(payload && payload.length) {
          let data = payload[0].data;
          let locationData = {};
          Object.keys(data).forEach(key => {
            data[key].timeCloud = dayjs(data[key].timeCloud.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
            if(key.indexOf('__location__') !== -1) {
              const cacheKey = key.split('__location__.')[1];
              locationData[cacheKey] = JSON.parse(JSON.stringify(data[key]));
              delete data[key];
            }
          })
          // data = Object.assign(data, {
          //   '__location__': locationData
          // });
        }
        this.setData({
          deviceRealtimeData: payload && payload.length ? payload[0].data : {},
          deviceRealtimeDataLength: payload && payload.length ? Object.keys(payload[0].data).length : 0,
        })
        this.setData({
          loading: false
        })
        Toast.clear();
      })
  },

  getUserInfo() {
    let app = getApp();
    app.request("GET", `/account-manage/v1/user/${this.data.userInfo.user.id}`)	 
      .then(res => {
        const userInfo = Object.assign(this.data.userInfo, res.data);
        this.setData({
          userInfo
        });
      })
  },

  goDeviceAlarm(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    wx.setStorageSync('deviceInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: `/pages/device/alarm/index`
    })
  },
  goDeviceRealtimeLocation(e) {
    Toast({
      message: '即将上线，敬请期待',
      position: 'top'
    });
  },
  goDeviceTraceReplay(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    wx.setStorageSync('deviceInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: '/pages/device/traceReplay/index'
    })
  },
  goDeviceElectricFence() {
    Toast({
      message: '即将上线，敬请期待',
      position: 'top'
    });
    // wx.navigateTo({
    //   url: '/pages/device/electricFence/index'
    // });
  },
  goDeviceCommandSend(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    wx.setStorageSync('deviceInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: '/pages/device/commandSend/index'
    })
  },
  goDeviceUnlockingMachine() {
    Toast({
      message: '即将上线，敬请期待',
      position: 'top'
    });
    // wx.navigateTo({
    //   url: '/pages/device/unlockingMachine/index'
    // })
  }
});