/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {rootcloud} from "../../../utils/store";
import {config} from "../../../utils/config";

Page({
  data: {
    latitude: 23.102118,
    longitude: 113.373193,
    currentValue: 50,
    canPlay: false,
    playIndex: 0,
    markers: [],
    polyline: [],
    deviceTraceList: [],
    deviceColumnsList: [],
    date: '',
    minDate: new Date('2020/01/01').getTime(),
    maxDate: new Date('2021/12/31').getTime(),
    show: false
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
      deviceInfo: deviceInfoObj,
      date: this.formatDate()
    });
    this.getDeviceHistoryData(deviceInfoObj.thingId, deviceInfoObj.modelId);
  },
  // 获取指定设备的历史数据
  getDeviceHistoryData(thingId, modelId) {
    const nowDate = this.data.date;
    const startTime = new Date(`${nowDate} 00:00:00`).toJSON();
    const endTime = new Date(`${nowDate} 23:59:59`).toJSON();
    wx.request({
      url: `${config.API_GATEWAY}/historian-manage/v1/historian/models/${modelId}/things/${thingId}?startTime=${startTime}&endTime=${endTime}&properties=["__location__.longitude","__location__.latitude"]`,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + rootcloud.token
      },
      success: (res) => {
        const payload = res.data.payload;
        this.setData({
          markers: [],
          polyline: [],
          canPlay: false,
          playIndex: 0,
          deviceTraceList: payload && payload.length ? payload[0].rows.slice(0, 50) : [],
          deviceColumnsList: payload && payload.length ? payload[0].columns.slice(0, 50) : [],
        });
        let longitudeIndex = 0;
        let latitudeIndex = 0;
        if(payload && payload.length) {
          const columns = payload[0].columns;
          if(columns && columns.length) {
            columns.forEach((item, index) => {
              item === '__location__.longitude' && (longitudeIndex = index);
              item === '__location__.latitude' && (latitudeIndex = index);
            })
          }
        }
        const deviceTraceList = this.data.deviceTraceList
        const currentPoints = [];
        const polyline = [{
          points: [],
          color: '#00B259',
          dottedLine: false,
          borderWidth: 6,
          width: 6
        }];
        let firstRender = true;
        if (deviceTraceList && deviceTraceList.length) {
          deviceTraceList.forEach((item, index) => {
            const latitude = item[latitudeIndex];
            const longitude = item[longitudeIndex];
            if(index === 0) {
              this.setData({
                latitude,
                longitude
              })
            }
            if (latitude && longitude) {
              currentPoints.push({
                latitude,
                longitude
              });
              if(firstRender) {
                this.setData({
                  markers: [{
                    id: 0,
                    iconPath: "/assets/home_online.png",
                    latitude,
                    longitude,
                    width: 25,
                    height: 25
                  }]
                })
                firstRender = false;
              }
              polyline[0].points = currentPoints;
              this.setData({
                polyline: polyline
              });
            }
          });
          const MapContext = wx.createMapContext('Map');
          MapContext.includePoints({
            points: this.data.polyline[0].points
          })
        }
      }
    });
  },
  playTrace() {
    const deviceTraceList = this.data.deviceTraceList;
    const deviceColumnsList = this.data.deviceColumnsList;
    this.setData({
      canPlay: true
    });
    if(deviceTraceList && deviceTraceList.length) {
      let longitudeIndex = 0;
      let latitudeIndex = 0;
      if(deviceColumnsList && deviceColumnsList.length) {
        const columns = deviceColumnsList;
        if(columns && columns.length) {
          columns.forEach((item, index) => {
            item === '__location__.longitude' && (longitudeIndex = index);
            item === '__location__.latitude' && (latitudeIndex = index);
          })
        }
      }
      this.timer = setInterval(() => {
        let playIndex = this.data.playIndex;
        if(!this.data.canPlay) {
          clearInterval(this.timer);
          return;
        }
        if(playIndex < deviceTraceList.length) {
          const latitude = deviceTraceList[playIndex][latitudeIndex];
          const longitude = deviceTraceList[playIndex][longitudeIndex];
          const MapContext = wx.createMapContext('Map');
          MapContext.translateMarker({
              markerId: 0,
              destination: {
                latitude,
                longitude,
              },
              autoRotate: true,
              rotate: 30,
              duration: 1000
          });
          playIndex++;
          this.setData({
            playIndex
          });
        } else {
          this.setData({
            playIndex: 0,
            canPlay: false
          });
          clearInterval(this.timer);
        }
      }, 1000);
    }
  },
  stopTrace() {
    this.setData({
      canPlay: false
    });
  },
  onDisplay() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  formatDate(date) {
    if(!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  },
  onConfirm(event) {
    this.setData({
      show: false,
      date: this.formatDate(event.detail),
    });
    this.getDeviceHistoryData(this.data.deviceInfo.thingId, this.data.deviceInfo.modelId);
  }
})