//app.js
const wxp = require('utils/util.js').wxp
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {  
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  uploadingFileManager: {
    uploadingFiles: {
      // "tempFilePaths":{
      // imageId:"",
      // complete:""  //"uploading","success","uncertain"
      // iconType:""
      // text:""
      // }
    },
    uncertainFiles: {

    },
    //订阅者
    subscribers: [],
    //添加订阅者
    addSubscriber: function (pageNameArg, methodArg) {
      this.subscribers.push({
        pageName: pageNameArg,
        method: methodArg
      })
    },
    //
    removeSubscriber: function (pageNameArg) {
      for (let subscriber of this.subscribers) {
        if (subscriber.pageName == pageNameArg) {
          subscriber = null
        }
      }
    },
    //
    clearSubscriber: function () {
      subscribers = []
    },
    //
    notify: function (msg, data) {
      for (let subscriber of this.subscribers) {
        subscriber.method(msg, data)
      }
      /*
      "uncertain" 有未传成功的图片{文件的tempFilePath用于显示，imageId用于提交手动更新数据,text用于显示} 
      "upload" 有文件上传{}
      "delete" 
      "deleteuncertain"
      "queueempty" 上传队列为空
      "uncertainempty" 不确定图片队列为空
      */
    },
    //添加到上传文件队列中
    addToQueue: function (tempFilePaths) {

      var that = this
      console.log(that)
      // let existFileAmount = this.uploadingFiles.length
      // uploadingFiles.push(...(tempFilePaths.map((current, i) => {
      //   return {
      //     tempFilePaths: current,
      //     imageId: "",
      //     complete: "uploading", //"uploading","success","uncertain"
      //     iconType: "fa fa-spinner fa-spin"
      //   }
      // })))

      for (let index = 0; index < tempFilePaths.length; index++) {
        this.uploadingFiles[tempFilePaths[index]] = {
          imageId: "",
          complete: "uploading", //"uploading","success","uncertain"
          // iconType: "fa fa-spinner fa-spin"
        }
        this.notify("upload", {})
        wxp.uploadFile({
            url: getApp().httpsConfig.serverAddress + '/upload',
            filePath: tempFilePaths[index],
            name: "file",
            formData: {
              "user": getApp().globalData.uid
            }
          })
          .then((res) => {
            if ((res) => {
                //TODO判断是否需要手动输入，不需要返回true，需要返回false              
              }) {
              this.removeFromQueue(tempFilePaths[index])
              this.notify("success",{})
            } else {
              this.uncertainFiles[tempFilePaths[index]] = {
                imageId: res.data.image,
                text: res.data.text
              }
              this.notify("uncertain",{
                tempFilePath:tempFilePaths[index],
                imageId:res.data.image,
                text:res.data.text
              })
              this.removeFromQueue(tempFilePaths[index])
            }
            if (this.getObjectNotNullLength(this.uploadingFiles) === 0) {
              this.notify("queueempty",{})
              this.clearQueue()
            }
            // let completeString = res.data.level > 0.9 ? "success" : "uncertain"
            // let iconType = {
            //   success: "fa fa-spinner fa-spin",
            //   uncertain: "fa fa-spinner fa-spin"
            // }
            // this.uploadingFiles[tempFilePaths[index]] = {
            //   imageId: res.data.text,
            //   complete: completeString, //"success","uncertain"
            //   iconType: iconType[completeString],
            //   text: res.data.text,
            // }
            // this.notify(completeString, {
            //   tempFilePath: tempFilePaths[index]
            // })
          })
      }
    },
    // //更新队列元素信息
    // updateQueue: function (tempFilePath, data) {

    //   if (data.imageId) this.uploadingFiles.imageId
    // },
    //指定队列元素移除出队列
    removeFromQueue: function (tempFilePath) {
      this.uploadingFiles[tempFilePath] = null
      this.notify("delete", {
        tempFilePath: tempFilePath
      })
    },
    removeFromUncertain:function(tempFilePath){
      this.uncertainFiles[tempFilePath]=null
      this.notify("deleteuncertain",{
        tempFilePath: tempFilePath
      })
      if (this.getObjectNotNullLength(this.uncertainFiles) === 0) {
        this.notify("uncertainempty",{})
        
      }
      
    },
    //重置上传队列
    clearQueue: function () {
      this.uploadingFiles = {}
    },
    //重置不确定图片队列
    clearUncertain:function(){
      this.uncertainFiles={}
    },
    getObjectNotNullLength: function (obj) {
      let count = 0
      let propList = Object.getOwnPropertyNames(obj)
      for (let prop of propList) {
        if (obj[prop]) {
          count = count + 1
        }
      }
      return count
    }

  },
  globalData: {
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    userInfo: null,
    uid: "02150fa0-10d4-4ca6-a130-f35e1148546b", //TODO 测试用
    uname: null,
    lastSearchInfo: {
      searchString: "",
      fileInfo: [
        // {imageId: "",
        // url: "",
        // savedPath: ""}
      ],
    }
  },
  httpsConfig: {
    serverAddress: 'https://fakartist.com'
  }
})