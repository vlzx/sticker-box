//index.js
//获取应用实例
const app = getApp()
var wxp = require("../../utils/util.js").wxp

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    navbarConfig: {
      iconType: "fa fa-bars",
      title: "",
      statusBarHeight: app.globalData.statusBarHeight,
    },
    searchPlaceholder: "",
    showMask: false, //控制隐藏显示遮罩层
    showPopupMenu: false, //控制隐藏显示菜单
    lastSearchString: "",//用于展示搜索结果
    lastSearchSavedFileList:[],
    uploadingFilesAmount: 0,
    picAmount: 121
  },
  /*事件处理函数
  -----------------------------*/
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    app.uploadingFileManager.addSubscriber("index", (msg, data) => {
      let that = this
      const method = {
        "uncertain": function (data) {
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "upload": function (data) {
          console.log("test")
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "delete": function (data) {
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "success":function (data) {
          console.log("index test point 2")
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
      }
      if(method[msg]){
        method[msg](data)
      }
    })
  },
  //搜索
  onConfirmSearch: function (e) {
    var that = this
    console.log("confirmed")
    console.log("evalue:" + e.detail.value)
    console.log("datavalue:" + this.data.lastSearchString)
    if (!(e.detail.value === this.data.lastSearchString)) { //搜索文本与上次不同时进行查询
      console.log("搜索内容与上次不相同")
      wxp.request({
        url: app.httpsConfig.serverAddress + "/search",
        data: {
          user: app.globalData.userId,
          keyword: e.detail.value
        }
      }).then(res => { //处理服务器返回的静态链接
        that.setData({
          lastSearchSavedFileList:res.data.map(input=>app.httpsConfig.serverAddress+"/"+input)
        })
        wxp.removeStorage({
          key:"lastSearchInfo"
        })
        console.log("测试that:" + (that == this))
        console.log(res)
        let resList = res.data
        console.log(resList)
        let resultAmount = resList.length
        let completeFlagList = {
          flagList: new Array(resultAmount),
          allComplete: function () {
            for (let flag of this.flagList) {
              if (!flag) {
                return false
              }
            }
            return true
          }
        }
        // console.log(res)
        for (let index = 0; index < resultAmount; index++) {
          let url = resList[index]
          wx.downloadFile({
            url: app.httpsConfig.serverAddress + "/" + url,
            success: function (res) {
              wxp.saveFile({
                tempFilePath: res.tempFilePath,
                // complete: function (res) {
                //   completeFlagList[index] = true
                //   console.log("complete")
                //   if (completeFlagList.allComplete()) {
                //     app.globalData.lastSearchInfo.searchString = e.detail.value
                //     wxp.setStorage({
                //       key: "lastSearchInfo",
                //       data: app.globalData.lastSearchInfo
                //     })
                //   }
                // }
              }).then(res => {
                console.log("测试点1：",that.data.lastSearchSavedFileList)
                //TODO 改为即使展示，后台下载
                // that.data.lastSearchSavedFileList.push(res.savedFilePath)
                // that.setData({ //更新图片显示数据
                //   lastSearchSavedFileList: that.data.lastSearchSavedFileList
                // })
                app.globalData.lastSearchInfo.fileInfo.push({
                  savedPath: res.savedFilePath
                })
              }).finally(res => {
                completeFlagList[index] = true
                console.log("complete")
                //TODO 第一次登陆时查询 是否有uid，有的话查是否有历史记录，有的话展示
                if (completeFlagList.allComplete()) {
                  app.globalData.lastSearchInfo.searchString = e.detail.value
                  wxp.setStorage({
                    key: "lastSearchInfo",
                    data: app.globalData.lastSearchInfo
                  })
                }
              })
            }
          })
        }
      })
    }
    this.setData({
      lastSearchString: e.detail.value
    })
  },
  //响应点击菜单按钮弹出菜单和遮罩层
  onTapTopLeftIcon: function () {
    console.log(11)
    this.setData({
      showMask: true,
      showPopupMenu: true
    })
  },
  //响应点击上传队列选项
  onTapQueue: function () {
    wx.navigateTo({
      url: "../upload_queue/upload_queue"
    })
  },
  //响应点击反馈选项
  onTapFeedback: function () {
    wx.navigateTo({
      url: "../feedback/feedback"
    })
  },
  //响应点击遮罩层关闭菜单和遮罩层
  onTapMask: function () {
    console.log(11)
    this.setData({
      showMask: false,
      showPopupMenu: false
    })
  },
  //相应点击上传图片按钮，上传图片
  onTapUploadImage: function () {
    if(!app.globalData.userId){
      app.login()
    }else{
    // console.log(wxp)
    wxp.chooseImage({
      sizeType: "compressed"
    })
      .then((res) => {
        // app.globalData.uploadingFilePaths=res.tempFilePaths
        // wx.navigateTo({
        //   url:"../upload_queue/upload_queue"
        // })
        app.uploadingFileManager.addToQueue(res.tempFilePaths)
        // for (let index = 0; index < res.tempFilePaths.length; index++) {
        //   wxp.uploadFile({
        //       url: app.httpsConfig.serverAddress + '/test/upload',
        //       filePath: tempFilePaths[index],
        //       name: 'file'
        //     })
        //     .then((res) => {
        //       console.log(res)
        //       app.globalData.upLoadImage[index]
        //     })
        // }
      })
    }


    // var that = this
    // wx.chooseImage({
    //   sizeType: "compressed",
    //   success: function (res) {
    //     that.setData({
    //       uploadImageList: res.tempFilePaths,
    //       searchResultList: res.tempFilePaths //TODO 添加图片后直接展示，测试用
    //     });
    //     wx.uploadFile({
    //       url: 'https://fakartist.com/test',
    //       filePath: that.data.searchResultList[0],
    //       name: 'file',
    //       success:function(res){
    //         const data=res.data
    //         console.log("上传图片(小程序端临时地址):" + that.data.uploadImageList[0]+"\n返回数据：\n"+data)
    //       },
    //       fail:function(res){
    //         console.log(res)
    //       }
    //     })
    //   }
    // })

  },
  //响应点击图片事件,预览图片
  onTapPreviewImage: function (e) {
    wx.previewImage({
      urls: this.data.lastSearchSavedFileList,
      current:e.currentTarget.dataset.imageId
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})