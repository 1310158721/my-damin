/**
 * 工具函数
 */

/**
 * 防抖函数
 * 一个需要频繁触发的函数，在规定时间内，只让最好一次生效，前面的不生效
 * 规定时间内多次点击，最后一次才生效
 * @param { 需要执行的函数 } fn 
 * @param { 规定的时间期限 } delay 
 */
export const $preventShake = (fn, delay) => {
  // 记录上一次函数触发的时间
  let lastTime = 0;
  return function () {
      // 记录当前函数触发的时间
      let nowTime = new Date().getTime();
      if (nowTime - lastTime > delay) {
          // 修正 this 指向
          fn.call(this);
          // 同步时间
          lastTime = nowTime;
      }
  };
};

/**
 * 节流函数
 * 一个需要频繁触发的函数，在规定时间内，只让最好一次生效，后面的不生效
 * 规定时间内多次点击，第一次才生效
 * @param { 需要执行的函数 } fn 
 * @param { 规定的时间期限 } delay
 * @param { 传递的参数 } params
 */
export const $throttle = (fn, delay) => {
  // 记录上一次函数触发的时间
  let lastTime = 0;
  return function () {
      // 记录当前函数触发的时间
      let nowTime = new Date().getTime();
      if (nowTime - lastTime > delay) {
          // 修正 this 指向
          fn.call(this, ...arguments);
          // 同步时间
          lastTime = nowTime;
      }
  };
};

/**
 * 日期格式化
 * @param {date} date
 * @param {string} [fmt='yyyy-MM-dd hh:mm:ss']
 * @returns {string}
 */
export const $formDate = (date, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};
