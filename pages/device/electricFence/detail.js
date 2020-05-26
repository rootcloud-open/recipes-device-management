/*
* Licensed Materials - Property of ROOTCLOUD
* THIS MODULE IS "RESTRICTED MATERIALS OF ROOTCLOUD"
* (c) Copyright ROOTCLOUD Inc. 2020 All Rights Reserved
*
* The source code for this program is not published or
* otherwise divested of its trade secrets
*/

const MAP_OPTION = {
  latitude: 23.099994,
  longitude: 113.324520
}

Page({
  data: {
    checked: true,
    slideOption: {
      min: 0,
      max: 500
    },
    mapOption: {
      ...MAP_OPTION
    },
    circles: [{
      latitude: MAP_OPTION.latitude,
      longitude: MAP_OPTION.longitude,
      radius: 200,
      strokeWidth: 0.5,
      color: '#00B259',
      fillColor: '#EAF8F1AA'
    }],
    markers: [{
      iconPath: "/assets/home_online.png",
      id: 0,
      latitude: MAP_OPTION.latitude - 0.0002,
      longitude: MAP_OPTION.longitude,
      width: 25,
      height: 25
    }]
  }
})