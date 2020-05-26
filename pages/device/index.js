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
    showType: 'map', // list
    markers: [],
    deviceList: []
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
      this.getDevices();
    }
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
        if(payload && payload.length) {
          const deviceIdList = []
          payload.forEach(item => {
            if(item.model && item.model.category && item.model.category.length) {
              const category = JSON.parse(item.model.category);
              item.model.category = category.join('/').split('/')[category.length - 1];
              item.model.categoryPath = category.join('/');
              item.deviceName = item.name;
              item.created = dayjs(item.created).format('YYYY/MM/DD HH:mm:ss');
            } else {
              item.model.category = [];
            }
            deviceIdList.push({
              deviceId: item.thingId,
              deviceTypeId: item.model.modelId,
              classId: 'DEVICE'
            });
            this.setData({
              deviceList: payload && payload.length ? payload : []
            });
          });
          this.getDevicesStatusInfo(deviceIdList);
        }
      }
    });
  },
  // 获取设备状态信息
  getDevicesStatusInfo(param) {
    wx.request({
      url: `${config.API_GATEWAY}/thing-instance/v1/device/device-instances/status`,
      method: 'GET',
      // data: param,
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        const deviceList = this.data.deviceList;
        const markers = [];
        if(deviceList && deviceList.length && payload && payload.length) {
          deviceList.forEach((item, index) => {
            item = Object.assign(item, payload[index]);
            item.created = dayjs(item.created).format('YYYY/MM/DD HH:mm:ss');
            item.updated = dayjs(item.updated).format('YYYY/MM/DD HH:mm:ss');
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
          });
          this.setData({
            deviceList,
            markers
          });
        }
      }
    });
  },

  // 获取设备模型信息
  getDevicesModelInfo() {
    wx.request({
      url: `${config.API_GATEWAY}/thing-instance/v1/thing/thing-classes?thingType=device`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
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
      }
    });
  },

  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.detail.markerId)
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