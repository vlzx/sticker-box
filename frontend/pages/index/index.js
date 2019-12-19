//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    searchResultUrlList:[],
    searchResultLocalPathList: [], //
    searchResultLocalFileList: [], //本地文件地址
    showMask: false, //控制隐藏显示遮罩层
    showPopupMenu: false //控制隐藏显示菜单
  },
  /*事件处理函数
  -----------------------------*/
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
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
  },
  //响应点击菜单按钮弹出菜单和遮罩层
  onTapMenuIcon: function () {
    console.log(11)
    this.setData({
      showMask: true,
      showPopupMenu: true
    })
  },
  //响应点击上传队列选项
  onTapQueue: function () {
    wx.navigateTo({
      url:"../upload_queue/upload_queue"
    })
  },
  //响应点击反馈选项
  onTapFeedback: function () {
    wx.navigateTo({
      url:"../feedback/feedback"
    })
  },
  //响应点击遮罩层关闭菜单和遮罩层
  onTapMask: function () {
    console.log(11)
    this.setData({
      showMask:false,
      showPopupMenu:false
    })
  },
  //upload image when touching floating action button
  onTapUploadImage: function () {
    var that = this
    wx.chooseImage({
      sizeType: "compressed",
      success: function (res) {
        that.setData({
          searchResultList: res.tempFilePaths
        });
      }
    })
  },
  //响应点击图片事件,预览图片
  onTapPreviewImage:function() {
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