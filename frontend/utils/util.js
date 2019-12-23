import { promisifyAll, promisify } from '../libs/miniprogram-api-promise/src/index.js';

const wxp = (()=>{
  // promisify all wx's api
  let tmpwxp={}
  promisifyAll(wx, tmpwxp)
  console.log(tmpwxp.getSystemInfoSync())//TODO
  tmpwxp.getSystemInfo().then(console.log)//TODO 
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

module.exports = {
  formatTime: formatTime,
  wxp:wxp
}
