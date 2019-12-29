Component({
  properties: {
    multiline: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: ''
    },
    maxlength: {
      type: Number,
      value: 200
    },
    initText: {
      type: String,
      value: ''
    },
    initImageId: {
      type: String,
      value: ''
    },
    tempFilePath: {
      type: String,
      value: ''
    }
  },

  data: {
    modalBottom: '',
    modalHeight: '',
    text: '',
    shadowAnimation: 'shadowDisplay',
    modalAnimation: 'modalDisplay',
    shadowOpacity: '0.65',
    modalOpacity: '1',
    imageId: ''
  },

  attached: function () {
    var res = wx.getSystemInfoSync()
    //console.log("ib测试点4：", this.properties.initText)
    //console.log("ib测试点5：", this.properties.initimageId)
    this.setData({
      modalBottom: this.data.multiline ? (res.screenHeight - 234).toString() : (res.screenHeight - 178).toString(),
      modalHeight: this.data.multiline ? '468' : '355',
      text: this.properties.initText,
      imageId: this.properties.initImageId
    })
  },

  methods: {
    // 监听用户输入
    onInput: function (e) {
      //console.log("inputBox:测试点3：", e)
      this.setData({
        text: e.detail.value
      })
    },

    // 隐藏输入框
    hideInputBox: function () {
      this.setData({
        shadowAnimation: 'shadowHide',
        modalAnimation: 'modalHide',

        // shadowOpacity: '0',
        // modalOpacity: '0'
      })
    },

    // 单击取消事件
    onCancelTap: function () {
      var that = this
      // this.hideInputBox()
      //console.log("inputBpx:测试点2:")
      this.triggerEvent('inputCancel', {
        text: that.data.text,
        imageId: that.properties.initimageId
      })
      // setTimeout(function () {
      //   that.triggerEvent('inputCancel')
      // }, 100)
    },

    // 单击确定事件
    onConfirmTap: function () {
      var that = this
      // this.hideInputBox()
      //console.log("inputBpx:测试点1:", that.data.text)
      //console.log("ib测试点6:", that.data.imageId)
      this.triggerEvent('inputConfirm', {
        text: that.data.text,
        imageId: that.data.imageId,
        tempFilePath: that.properties.tempFilePath
      })
      // setTimeout(function () {
      //   that.triggerEvent('inputConfirm', that.data.text)
      // }, 100)
    },

    // 捕获背景的点击事件以防止冒泡
    tapCatcher: function () {}
  }
})