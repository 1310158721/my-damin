/**
 * 必须要结合vscode的setting.json文件来使用
 */

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    // 支持vue文件以及vue模板的template不报错
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  rules: {
    semi: ['error', 'always'], // 强制使用分号结尾
    quotes: ['error', 'single'], // 强制使用单引号
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0, // 非正式环境允许使用 debugger 命令
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0, // 非正式环境允许使用 console.log 命令
    'space-before-function-paren': ['error', 'always'], // 函数名与括号之间空一格
    'linebreak-style': ['error', 'unix'], // 换行风格
    'no-multiple-empty-lines': ['error', { max: 1 }] // 最多连续空行行数
  }
};
