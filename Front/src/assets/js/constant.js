export const RegExp = {
  ACCOUNT: /^[a-z-A-Z]{4,10}$/, // 用户账号，4～10个的字母
  PASSWORD: /^[a-zA-Z][a-zA-Z0-9]{3,9}$/, // 用户密码，4～10个的字母或数字组合
  USERNAME: /[\u4e00-\u9fa5_a-zA-Z]{3,10}$/, // 用户名称，4～10个的字母或中文组合
  MOBILE: /^[1]([3-9])[0-9]{9}$/ // 用户手机号
};
