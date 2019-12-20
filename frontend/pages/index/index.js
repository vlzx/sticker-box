//index.js
//获取应用实例
const app = getApp()
var wxp=require('../../utils/util.js').wxp

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    navbarConfig:{
      iconType:"fa fa-bars",
      title:"",
      statusBarHeight:app.globalData.statusBarHeight,
      
    },
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
    // console.log(wxp)
    wxp.chooseImage({
      sizeType: "compressed"
    }).then((res)=>{
      for(let tempFilePath of res.tempFilePaths){
        wxp.uploadFile({
          url: app.httpsConfig.serverAddress+'/test/upload',
          filePath: tempFilePath,
          name: 'file'
        }).then((res)=>{
          console.log(res)
        })
      }
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