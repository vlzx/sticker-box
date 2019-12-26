// pages/upload_queue/upload_queue.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarConfig: {
      iconType: "fa fa-chevron-left",
      title: "上传队列",
      statusBarHeight: app.globalData.statusBarHeight,
    },
    uncertainFiles: [{
      imageId: "064a84e8-5bab-40c2-bf27-674ac1b3a516",//TODO测试用id
      tempFilePath: "../../res/image/微信图片_20181025190245.jpg",
      text: "这段文字用于描述图片内容,但是可能存在不准确,需要手动更新"
    }, {
      imageId: "064a84e8-5bab-40c2-bf27-674ac1b3a516",//TODO测试用id
      tempFilePath: "../../res/image/微信图片_20181025190245.jpg",
      text: "这段文字用于描述图片内容,但是可能存在不准确,需要手动更新"
    },
    ],
    showInputbox: false,
    inputBoxValue: {},
    initText: "",
    initImageId: "",
    currentModalIndex:-1
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
    console.log("rest")
    wx.navigateTo({
      url: "../index/index"
    })
  },
  //
  onTapShowInputbox: function (e) {
    //TODO
    let that = this
    let index = e.currentTarget.dataset.index
    console.log(e.currentTarget.dataset.index)
    this.setData({
      // inputboxValue:{
      //   text:that.data.uncertainFiles[index].text,
      //   imageId:that.data.uncertainFiles[index].imageId
      // },
      initText: that.data.uncertainFiles[index].text,
      initImageId: that.data.uncertainFiles[index].imageId,
      currentModalIndex:index
    })
    console.log("uq测试点6：",that.data.uncertainFiles[index].text)
    console.log("uq测试点7：",that.data.uncertainFiles[index].imageId)
    this.setData({
      showInputbox: true
    })
  },
  onInputConfirm: function (e) {
    let that=this
    console.log("uq:测试点1:", e.detail)
    this.setData({
      showInputbox: false
    })
    var reqTask = wx.request({
      url: app.httpsConfig.serverAddress+"/keyword",
      data: {
        user: app.globalData.uid,
        image: e.detail.imageId,
        keyword: e.detail.text
      },
      method: 'POST',
      success: (result) => {
        console.log("uq测试点3：", result)
        if(that.data.currentModalIndex!=-1){
          that.data.uncertainFiles.splice(that.data.currentModalIndex,1)
          that.setData({
            uncertainFiles:that.data.uncertainFiles
          })
        }
      },
      fail: () => { },
      complete: () => { }
    });
  },
  //
  onInputCancel: function (e) {
    console.log("uq:测试点2:", e.detail)
    this.setData({
      showInputbox: false
    })
    //TODO
  },
  test: function () {
    console.log(e)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let uncertainFilePaths = Object.getOwnPropertyNames(app.uploadingFileManager.uncertainFiles)
    // this.setData({
    //   uncertainFiles: uncertainFilePaths.map((current) => {
    //     return {
    //       imageId: app.uploadingFileManager.uncertainFiles[current].imageId,
    //       tempFilePath: current,
    //       text: app.uploadingFileManager.uncertainFiles[current].text
    //     }
    //   })
    // })
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
        }
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