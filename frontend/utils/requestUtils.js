/*网络请求相关函数统一放在这里
获取的全局信息如用户
*/

//获取
const app = getApp()
const config={
    
}

/*用户登录 login
发送【用户code】。返回（登录结果状态码：登录成功，登录失败）和（用户uuid）
*/
const login = ()=>{
    wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          
        }
      })
}
/*上传图片 upload
  1. 发送【图片文件】。返回（图片uuid）和（表示上传成功的状态码）
  2. 上传图片成功后，发送查询识别结果的长链接请求（图片识别可信度数值）和（识别文本）
*/
const uploadImage = (imageFileList) => {
   wx.chooseImage({
    success (res) {
      const tempFilePaths = res.tempFilePaths
      wx.uploadFile({
        url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
        filePath: tempFilePaths[0],
        name: 'file',
        formData: {
          'user': 'test'
        },
        success (res){
          const data = res.data
          //do something
        }
      })
    }
  })
}/*搜索图片 search 
发送【查询文本】。返回（图片静态链接列表）
*/
const searchImage=(queryString)=>{
    
}
/*手动添加keyword
发送【用户id userID】【搜索文本 updateString】和【图片id imageId】。返回（添加结果状态码：添加成功，添加失败）
*/
const updateKeyword=(userId,imageId,updateString)=>{

}
/*查询上传&识别状态
发送【用户id userID】和【图片id imageId】。根据图片是否在用户图片库中以及是否有keyword，
返回（结果状态码：无相关图片，未完成自动识别，已完成自动识别-需手动添加，
已完成自动识别-无需手动添加，已手动添加信息）
*/
const confirmUploadStatus=(userId,imageId)=>{

}
/*反馈
发送【反馈文本 feedbackString】。存储到数据库后，返回（上传状态码：上反馈成功，反馈失败）
*/
const sendFeedback=(feedbackString)=>{

}
/**/
module.exports = {
    login: login,
    uploadImage: uploadImage,
    searchImage: searchImage,
    updateKeyword: updateKeyword,
    confirmUploadStatus: confirmUploadStatus,
    sendFeedback: sendFeedback
  }