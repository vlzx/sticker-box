// pages/upload_queue/upload_queue.js
const app = getApp()
var wxp = require("../../utils/util.js").wxp

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarConfig: {
      iconType: "fa fa-chevron-left",
      title: "手动更新队列",
      statusBarHeight: app.globalData.statusBarHeight,
    },
    uncertainFiles: [],
    showInputbox: false,
    inputBoxValue: {},
    initText: "",
    initImageId: "",
    initTempFilePath: "",
    currentModalIndex: -1
    /*
      {
        imageId:"",
        tempFilePath:"",
        complete:false
        iconType:""
        text:""
      }
    */
  },

  //响应点击返回按钮返回上一页
  onTapTopLeftIcon: function () {
    //console.log("rest")
    wx.navigateTo({
      url: "../index/index"
    })
  },
  //
  onTapShowInputbox: function (e) {
    //TODO
    let that = this
    let index = e.currentTarget.dataset.index
    //console.log(e.currentTarget.dataset.index)
    this.setData({
      // inputboxValue:{
      //   text:that.data.uncertainFiles[index].text,
      //   imageId:that.data.uncertainFiles[index].imageId
      // },
      initText: that.data.uncertainFiles[index].text,
      initImageId: that.data.uncertainFiles[index].imageId,
      initTempFilePath: that.data.uncertainFiles[index].tempFilePath,
      currentModalIndex: index
    })
    //console.log("uq测试点6：", that.data.uncertainFiles[index].text)
    //console.log("uq测试点7：", that.data.uncertainFiles[index].imageId)
    //console.log("uq测试点8：", that.data.uncertainFiles[index].tempFilePath)
    this.setData({
      showInputbox: true
    })
  },
  onInputConfirm: function (e) {
    let that = this
    //console.log("uq:测试点1:", e.detail)
    this.setData({
      showInputbox: false
    })
    var reqTask = wx.request({
      url: app.httpsConfig.serverAddress + "/keyword",
      data: {
        user: app.globalData.userId,
        image: e.detail.imageId,
        keyword: e.detail.text
      },
      method: 'POST',
      success: (result) => {
        //console.log("uq测试点3：", result)
        if (that.data.currentModalIndex != -1) {
          that.data.uncertainFiles.splice(that.data.currentModalIndex, 1)
          that.setData({
            uncertainFiles: that.data.uncertainFiles
          })
        }
        app.uploadingFileManager.removeFromUncertain(e.detail.tempFilePath)
        wx.showToast({
          title:"更新成功~",
          dutation:1500
        })
        let tmpSavedImageAmount = wx.getStorageSync("savedImageAmount")
        wxp.setStorage({
          key: "savedImageAmount",
          data: tmpSavedImageAmount + 1
        })
      },
      fail: () => {
        //TODO dialog修改失败
      },
      complete: () => {}
    });
  },
  //
  onInputCancel: function (e) {
    //console.log("uq:测试点2:", e.detail)
    this.setData({
      showInputbox: false
    })
    //TODO
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uncertainFilePaths = Object.getOwnPropertyNames(app.uploadingFileManager.uncertainFiles)
    let tempUncertainFiles=[]
    for(let index=0;index<uncertainFilePaths.length;index++){
      if(app.uploadingFileManager.uncertainFiles[uncertainFilePaths[index]]){
        tempUncertainFiles.push({
          imageId: app.uploadingFileManager.uncertainFiles[uncertainFilePaths[index]].imageId,
          tempFilePath: uncertainFilePaths[index],
          text: app.uploadingFileManager.uncertainFiles[uncertainFilePaths[index]].text
        })
      }
    }
    this.setData({
      uncertainFiles: tempUncertainFiles
    })


    app.uploadingFileManager.addSubscriber("upload_queue", (msg, data) => {
      let that = this
      const method = {
        "uncertain": function (data) {
          let tempUncertainFiles = that.data.uncertainFiles
          tempUncertainFiles.push({
            imageId: data.imageId,
            tempFilePath: data.tempFilePath,
            text: data.text
          })
          that.setData({
            uncertainFiles: tempUncertainFiles
          })
        },
        "deleteuncertain": function (data) {
          let tempUncertainFiles = that.data.uncertainFiles
          for (let index = 0; index < tempUncertainFiles.length; index++) {
            if (data.tempFilePath == tempUncertainFiles[index].tempFilePath) {
              tempUncertainFiles.splice(index, 1)
            }
          }
          that.setData({
            uncertainFiles: tempUncertainFiles
          })
        },
        "uncertainempty": function (data) {
          that.setData({
            uncertainFiles: []
          })
          //TODO 展示背景图片的判定
        }
      }
      if (method[msg]) {
        method[msg](data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log("eee", this.data.uncertainFiles)

    if (this.data.uncertainFiles.length == 0) {
      //console.log("aaa")
      wx.showToast({
        title: "没有表情需要手动更新文本，快去上传表情吧",
        icon: "none",
        duration: 2000,
        mask:true
      })
      setTimeout(() => {
        wx.navigateBack({})
      }, 2000)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})