const extend = require('util')._extend;
const aliyun = require('./aliyun');
const api = require('./api');

const mts = function(options) {
  let defaults = {
    host: 'mts.aliyuncs.com',
    accessid: 'testId',
    accesskey: 'testKeySecret',
    version: '2014-06-18',
    format: 'json'
  };

  extend(defaults, options);

  this.aliyun = aliyun(defaults);
  this.request = api(this.aliyun).request;
};

mts.prototype.submit = function(params, callback) {
  this.request(params, callback);
};

module.exports = mts;