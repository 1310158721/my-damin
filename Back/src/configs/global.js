/**
 * 全局相关配置
 */
const DEV = require('./dev');
const PROD = require('./prod');
const isProd = true;

isProd ? PROD.start() : DEV.start();

global.deleteOssPhotoTime = 2 * 3600 * 1000;
