/**
 * 全局相关配置
 */
const DEV = require('./dev');
const PROD = require('./prod');
const isProd = true;

isProd ? PROD.start() : DEV.start();
