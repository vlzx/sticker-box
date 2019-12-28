//app.js
const wxp = require('utils/util.js').wxp
App({
  onLaunch: function () {
    let that = this
    this.uploadingFileManager._this=this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //加载全局参数 
    wxp.getStorage({
        key: "userId"
      })
      .then(res => {
        //console.log("app point 1", res.data)
        that.globalData.userId = res.data
      })
    // wxp.getStorage({
    //     key: "rejectAuthorization"
    //   })
    //   .then(res => {
    //     //console.log("app point 7", res.data)
    //     that.globalData.rejectAuthorization = res.data
    //   })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        //console.log("app test point 4")
        if (res.authSetting['scope.userInfo']) {
          //console.log("app test point 4")
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              //console.log("app test point 5")
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
    _this:{},
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

      let that = this._this
      //console.log("app test point 1", that)
      // let existFileAmount = this.uploadingFiles.length
      // uploadingFiles.push(...(tempFilePaths.map((current, i) => {
      //   return {
      //     tempFilePaths: current,
      //     imageId: "",
      //     complete: "uploading", //"uploading","success","uncertain"
      //     iconType: "fa fa-spinner fa-spin"
      //   }
      // })))
      //console.log("app test point 20",tempFilePaths)
      for (let index = 0; index < tempFilePaths.length; index++) {
        //console.log()
        this.uploadingFiles[tempFilePaths[index]] = {
          imageId: "",
          complete: "uploading", //"uploading","success","uncertain"
          // iconType: "fa fa-spinner fa-spin"
        }
        this.notify("upload", {})
        wxp.uploadFile({
            url: that.httpsConfig.serverAddress + '/upload',
            filePath: tempFilePaths[index],
            name: "file",
            formData: {
              "user": that.globalData.userId
            }
          })
          .then(resJson => {
            let res = JSON.parse(resJson.data)
            if ((res => {
                //TODO判断是否需要手动输入，不需要返回true，需要返回false 
                //console.log("app test point 3", res)
                if (res.level > 0.96) {
                  return true
                } else {
                  return false
                }
              })(res)) {
              this.removeFromQueue(tempFilePaths[index])
              let tmpSavedImageAmount = wx.getStorageSync("savedImageAmount")
              //console.log("app test point 9", wx.getStorageSync("savedImageAmount"))
              wxp.setStorage({
                key: "savedImageAmount",
                data: tmpSavedImageAmount + 1
              })
              this.notify("success", {})
            } else {
              console.log("app test point 10", res)
              console.log("app test point 11", this)

              this.uncertainFiles[tempFilePaths[index]] = {
                imageId: res.image,
                text: res.content
              }
              console.log("app test point 8", this.uncertainFiles[tempFilePaths[index]])
              this.removeFromQueue(tempFilePaths[index])
              this.notify("uncertain", {
                tempFilePath: tempFilePaths[index],
                imageId: res.image,
                text: res.text
              })
            }
            if (this.getObjectNotNullLength(this.uploadingFiles) === 0) {
              this.notify("queueempty", {})
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
          }).catch(e=>{
            this.removeFromQueue(tempFilePaths[index])
            this.notify("delete")
            console.log("app test point 21",e)
          }).finally(res => {
            console.log("app test point 2,发送了一个文件")
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
    removeFromUncertain: function (tempFilePath) {
      this.uncertainFiles[tempFilePath] = null
      this.notify("deleteuncertain", {
        tempFilePath: tempFilePath
      })
      if (this.getObjectNotNullLength(this.uncertainFiles) === 0) {
        this.notify("uncertainempty", {})
      }

    },
    //重置上传队列
    clearQueue: function () {
      this.uploadingFiles = {}
    },
    //重置不确定图片队列
    clearUncertain: function () {
      this.uncertainFiles = {}
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
  login: function () {
    let that = this
    wxp.login()
      .then(res => {
        return wxp.request({
          url: that.httpsConfig.serverAddress + "/login",
          data: {
            code: res.code
          }
        })
      })
      .then(res => {
        //console.log(res)
        that.globalData.userId = res.data.user
        wx.setStorage({
          key: "userId",
          data: res.data.user,
          success: function () {
            //TODO 测试用，优化时删除
            //console.log("index point 1", res.data.user)
          }
        })
      })
  },
  globalData: {
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    userInfo: null,
    userId: "", //TODO 测试用 02150fa0-10d4-4ca6-a130-f35e1148546b
    uname: null,
    rejectAuthorization: false,
    longPressSetting: true,
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