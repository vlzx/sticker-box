import {
  promisifyAll,
  promisify
} from '../libs/miniprogram-api-promise/src/index.js';

const wxp = (() => {
  // promisify all wx's api
  let tmpwxp = {}
  promisifyAll(wx, tmpwxp)
  console.log(tmpwxp.getSystemInfoSync()) //TODO
  tmpwxp.getSystemInfo().then(console.log) //TODO 
  return tmpwxp
})()


const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 传入距1970年1月1日 00:00:00 UTC的毫秒数,根据该数,结合使用小程序的日期,返回相应的图片添加日期
 */
function getDateString(time) {
  var table = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  var todayProject = new Date()
  var today = Math.floor(todayProject.valueOf() / 86400000)
  var timeday = Math.floor(time / 86400000)
  if (timeday == today) {
    return "今天"
  } else if (timeday + 1 == today) {
    return "昨天"
  } else {
    let timedayProject = new Date(time)
    var year = timedayProject.getFullYear()
    var month = timedayProject.getMonth() + 1
    var date = timedayProject.getDate()
    var day = timedayProject.getDay()
    if (year == todayProject.getFullYear()) {
      return month + "月" + date + "日 " + table[day]
    } else {
      return year + "年" + month + "月" + date + "日 " + table[day]
    }
  }
}

module.exports = {
  formatTime: formatTime,
  wxp: wxp,
  getDateString: getDateString
}