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
import dayjs from 'dayjs';
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    showType: 'map', // list
    markers: [],
    deviceList: [],
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
      this.getDevices();
    }
  },
  // 获取设备列表
  getDevices() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/device/device-instances?classId=DEVICE")	 
      .then(res => {
        const payload = res.data.payload;
        if(payload && payload.length) {
          payload.forEach(item => {
            if(item.model && item.model.category && item.model.category.length) {
              const category = JSON.parse(item.model.category);
              item.model.category = category.join('/').split('/')[category.length - 1];
              item.model.categoryPath = category.join('/');
              item.deviceName = item.name;
              item.created = dayjs(item.created.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
            } else {
              item.model.category = [];
              item.deviceName = item.name;
              item.created = dayjs(item.created.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
            }
            this.setData({
              deviceList: payload
            });
          });
        } else {
          this.setData({
            deviceList: []
          });
        }
        this.getDevicesStatusInfo();
      })
  },
  // 获取设备状态信息
  getDevicesStatusInfo() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/device/device-instances/status")	 
      .then(res => {
        const payload = res.data.payload;
        const deviceList = this.data.deviceList;
        const markers = [];
        if(deviceList && deviceList.length && payload && payload.length) {
          let deviceIdIndexMap = {};
          payload.forEach((item, index) => {
            deviceIdIndexMap[item.thingId] = index + 1;
          })
          deviceList.forEach((item) => {
            if(deviceIdIndexMap[item.thingId]) {
              const deviceIdIndex = deviceIdIndexMap[item.thingId];
              item = Object.assign(item, payload[deviceIdIndex - 1]);
              if(item.created) {
                item.created = dayjs(item.created.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
              }
              if(item.updated) {
                item.updated = dayjs(item.updated.replace('+0000', '')).format('YYYY/MM/DD HH:mm:ss');
              }
              item.lastActivityTime = dayjs(item.lastActivityTime).format('YYYY/MM/DD HH:mm:ss');
              if(item.longitude && item.latitude) {
                markers.push({
                  iconPath: "/assets/home_online.png",
                  id: 0,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  width: 25,
                  height: 25
                })
              }
            }
          });
          this.setData({
            deviceList,
            markers
          });
        }
        this.setData({
          loading: false
        })
        Toast.clear();
      })
  },

  // 获取设备模型信息
  getDevicesModelInfo() {
    let app = getApp();
    app.request("GET", "/thing-instance/v1/thing/thing-classes?thingType=device")	 
      .then(res => {
        const payload = res.data.payload;
        const modelsById = {};
        payload.forEach(item => modelsById[item.modelId] = item);
        const deviceList = this.data.deviceList;
        if(deviceList && deviceList.length && payload && payload.length) {
          deviceList.forEach((item, index) => {
            item.model = modelsById[item.model.modelId];
          });
          this.setData({
            deviceList
          })
        }
      })
  },

  toggleShowType() {
    let showType = this.data.showType === 'map' ? 'list' : 'map';
    this.setData({ showType });
  },
  goDeviceDetail(e) {
    const deviceInfo = e.currentTarget.dataset.item;
    wx.setStorageSync('deviceInfo', JSON.stringify(deviceInfo));
    wx.navigateTo({
      url: `/pages/device/detail`
    });
  }
});