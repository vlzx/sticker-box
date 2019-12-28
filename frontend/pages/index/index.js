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
    searchPlaceholder: "关键字搜索",
    showMask: false, //控制隐藏显示遮罩层
    showPopupMenu: false, //控制隐藏显示菜单
    lastSearchSavedFileList: [],
    uploadingFilesAmount: 0,
    savedImageAmount: 0,
    greetMsg: {
      line1: "",
      line2: ""
    },
    longPressSetting: true
  },
  /*事件处理函数
  -----------------------------*/
  onLoad: function () {
    this.setData({
      longPressSetting: app.globalData.longPressSetting
    })
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
          //console.log("test")
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "delete": function (data) {
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
        },
        "success": function (data) {
          //console.log("index test point 2")
          that.setData({
            uploadingFilesAmount: app.uploadingFileManager.getObjectNotNullLength(app.uploadingFileManager.uploadingFiles)
          })
          wxp.getStorage({
            key: "savedImageAmount"
          }).then(res => {
            that.setData({
              savedImageAmount: res.data
            })
          })
        },
      }
      if (method[msg]) {
        method[msg](data)
      }
    })
  },
  onShow: function () {
    var that = this
    //onShow更新（时间，欢迎语，存储图片更新）
    let greetMsgVar = {
      line1: "",
      line2: ""
    }
    let savedImageAmountVar = 0
    wxp.getStorage({
      key: "savedImageAmount"
    }).then(res => {
      that.setData({
        savedImageAmount: res.data
      })
    })
    //TODO 文本生成
    let greetMsgList = ["在找表情？搜索一下吧~", "上传表情，自动识别文本", "轻松上传保存，快速搜索"]
    let hour = new Date().getHours()
    //console.log("index test point 8", hour)
    let period = ""
    if (hour < 4) period = '夜深了，晚安zzZ🌙'
    else if (hour < 8) period = 'Hi,早上好~☀'
    else if (hour < 12) period = 'Hi,上午好~☀'
    else if (hour < 14) period = 'Hi,中午好~☀'
    else if (hour < 17) period = '🙋 下午好~'
    else if (hour < 19) period = '🙋 傍晚好~'
    else period = '🙋 晚上好~'
    greetMsgVar.line1 = period
    greetMsgVar.line2 = greetMsgList[Math.floor(Math.random() * 3)]
    /*
    点击按钮上传第一张表情
    */
    that.setData({
      greetMsg: greetMsgVar
    })

    // if(app.user)
  },
  //搜索
  onConfirmSearch: function (e) {
    var that = this
    //console.log("confirmed")
    //console.log("evalue:" + e.detail.value)
    //console.log("datavalue:" + app.globalData.lastSearchInfo.searchString)
    if (!(e.detail.value === app.globalData.lastSearchInfo.searchString)) { //搜索文本与上次不同时进行查询
      //console.log("搜索内容与上次不相同")
      wxp.request({
        url: app.httpsConfig.serverAddress + "/search",
        data: {
          user: app.globalData.userId,
          keyword: e.detail.value
        }
      }).then(res => { //处理服务器返回的静态链接
        that.setData({
          lastSearchSavedFileList: res.data.map(input => app.httpsConfig.serverAddress + "/" + input)
        })
        if (res.data.length == 0) {
          wx.showToast({
            title: "没有相关表情，先上传一些吧~",
            icon: "none",
            duration: 1500
          })
        }
        wxp.removeStorage({
          key: "lastSearchInfo"
        })
        //console.log("测试that:" + (that == this))
        //console.log(res)
        let resList = res.data
        //console.log(resList)
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
        // //console.log(res)
        for (let index = 0; index < resultAmount; index++) {
          let url = resList[index]
          wx.downloadFile({
            url: app.httpsConfig.serverAddress + "/" + url,
            success: function (res) {
              wxp.saveFile({
                tempFilePath: res.tempFilePath,
                // complete: function (res) {
                //   completeFlagList[index] = true
                //   //console.log("complete")
                //   if (completeFlagList.allComplete()) {
                //     app.globalData.lastSearchInfo.searchString = e.detail.value
                //     wxp.setStorage({
                //       key: "lastSearchInfo",
                //       data: app.globalData.lastSearchInfo
                //     })
                //   }
                // }
              }).then(res => {
                //console.log("测试点1：", that.data.lastSearchSavedFileList)
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
                //console.log("complete")
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
    app.globalData.lastSearchInfo.searchString = e.detail.value
  },
  //响应点击菜单按钮弹出菜单和遮罩层
  onTapTopLeftIcon: function () {
    //console.log(11)
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
    //console.log(11)
    this.setData({
      showMask: false,
      showPopupMenu: false
    })
  },
  //相应点击上传图片按钮，上传图片
  onTapUploadImage: function () {
    //TODO 首次点击上传图片按钮提示获取用户名
    // if(!(app.globalData.userInfo)){
    //   //console.log("wdnmd")
    //   wx.authorize({
    //     scope:"scope.userInfo",
    //     success:function(){
    //       wx.getUserInfo({
    //         success: res => {
    //           //console.log("index test point 7")
    //           // 可以将 res 发送给后台解码出 unionId
    //           app.globalData.userInfo = res.userInfo
    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     },
    //     fail:function(){
    //       //如果拒绝授权用户信息，则设置【用户拒绝授权信息标识】
    //       //console.log("cao!")
    //       app.globalData.rejectAuthorization=true
    //       wx.setStorageSync({
    //         key:"rejectAuthorization",
    //         data:true
    //       })
    //     }
    //   })
    // }else{

    // }
    if (!app.globalData.userId) {
      app.login()
      wx.setStorage({
        key: "savedImageAmount",
        data: 0
      })
    }
    // //console.log(wxp)
    wxp.chooseImage({
        count:2,
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
        //       //console.log(res)
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
    //         //console.log("上传图片(小程序端临时地址):" + that.data.uploadImageList[0]+"\n返回数据：\n"+data)
    //       },
    //       fail:function(res){
    //         //console.log(res)
    //       }
    //     })
    //   }
    // })

  },
  onLongPressUploadImage: function () {
    if (!app.globalData.userId) {
      app.login()
      wx.setStorage({
        key: "savedImageAmount",
        data: 0
      })
    }
    if(this.data.longPressSetting){
      wxp.chooseMessageFile({
        count: 2,
        type: "image"
      }).then(res => {
        app.uploadingFileManager.addToQueue(res.tempFiles.map(current => current.path))
      })
    }
  },
  //响应点击图片事件,预览图片
  onTapPreviewImage: function (e) {
    console.log("index test point 23",e.currentTarget.dataset.imageIndex)
    wx.previewImage({
      urls: this.data.lastSearchSavedFileList,
      current: this.data.lastSearchSavedFileList[e.currentTarget.dataset.imageIndex]
    })
  },
  longPressSettingChanged: function () {
    if (this.data.longPressSetting) {
      this.setData({
        longPressSetting: false
      })
      app.globalData.longPressSetting = false
    } else {
      this.setData({
        longPressSetting: true
      })
      app.globalData.longPressSetting = true
    }
  }
  // getUserInfo: function (e) {
  //   //console.log(e)
  //   app.globalData.userInfo = e.detail.userInfo
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // },
})