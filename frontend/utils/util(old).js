/**目录
 *   更新已存储图片
 *   获取已存储图片
 *   根据时间点返回日期字符串
 */


/**
 * 更新已存储图片
 */
function renewSavedImage(imageList){
  wx.setStorage({
    key: "savedImage",
    data: imageList
  })
}
/**
 * 获取已存储图片
 */
function getSavedImage(){
  return wx.getStorageSync("savedImage")
}
/**
 * 传入距1970年1月1日 00:00:00 UTC的毫秒数,根据该数,结合使用小程序的日期,返回相应的图片添加日期
 */
function getDateString(time) {
  var table=["周日","周一","周二","周三","周四","周五","周六"]
  var todayProject=new Date() 
  var today= Math.floor(todayProject.valueOf() / 86400000)
  var timeday = Math.floor(time / 86400000)
  if (timeday== today){
    return "今天"
  }else if(timeday+1==today){
    return "昨天"
  }else{
    let timedayProject=new Date(time)
    var year = timedayProject.getFullYear()
    var month = timedayProject.getMonth() + 1
    var date = timedayProject.getDate()
    var day = timedayProject.getDay()
    if(year==todayProject.getFullYear()){
      return month+"月"+date+"日 "+table[day]
    }else{
      return year + "年" +month+"月"+date+"日 "+table[day]
    }
  }
}

module.exports = {
  renewSavedImage: renewSavedImage,
  getSavedImage: getSavedImage,
  getDateString: getDateString
}