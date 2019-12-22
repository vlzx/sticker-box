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
    uploadingFilesAmount:0,
    picAmount:121
  },
  /*事件处理函数
  -----------------------------*/
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }else {
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
    app.uploadingFileManager.addSubscriber("index",(msg, data)=>{
      let that =this
      const method={
        "uncertain":function(data){
          
        },
        "upload":function(data){
          console.log("test")
          that.setData({
            uploadingFilesAmount:app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "delete":function(data){
          that.setData({
            uploadingFilesAmount:app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
      }
      method[msg](data)
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
        url: app.httpsConfig.serverAddress + "/test/search",
        data: {
          userId: "test",
          keyword: e.detail.value
        }
      }).then(res => { //处理服务器返回的静态链接
        console.log("测试that:" + (that == this))
        let data = res.data
        let resultAmount = res.data.length
        let completeFlagList = {
          flagList: new Array(resultAmount),
          allComplete: function () {
            for (let flag of this.flagList) {
              if (!flag) {
                return flase
              }
            }
            return true
          }
        }
        console.log(res)
        for (let index = 0; index < resultAmount; index++) {
          let urlObj = res.data[index]
          wxp.downloadFile({
            url: urlObj.url,
          }).then(res => {
            wxp.saveFile({
              tempFilePath: res.tempFilePath,
              complete: function (res) {
                completeFlagList[index] = true
                console.log("complete")
                if (completeFlagList.allComplete()) {
                  app.globalData.lastSearchInfo.searchString = e.detail.value
                  wxp.setStorage({
                    key: "lastSearchInfo",
                    data: app.globalData.lastSearchInfo
                  })
                }
              }
            }).then(res => {
              let newList = this.data.lastSearchSavedPathList.push(res.savedFilePath)
              this.setData({ //更新图片显示数据
                lastSearchSavedPathList: newList 
              })
              app.globalData.lastSearchInfo.fileInfo.push({
                savedPath: res.savedFilePath
              })
            })
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
  onTapPreviewImage: function () {
    wx.previewImage({
      urls: searchResultLocalPathList,
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