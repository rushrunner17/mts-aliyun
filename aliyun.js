const crypto = require('crypto');
const extend = require('util')._extend;

/**
 *
 * 阿里云相关工具包
 *
 * @Ahthor      :   Thonatos.Yang
 * @Statement   :   部分代码拆分自aliyun-sdk
 */

const aliyun = (options) => {
  const obj = {};
  const utils = {};
  const defaults = options || {};

  const protectedP = {};

  /**
     * 使用请求参数构造规范化的请求字符串
     * Canonicalized Query String
     *
     * @param clearString
     * @returns {string}
     *
     * @From:   https://docs.aliyun.com/?spm=5176.7616369.9.5.pUOHPW#/pub/mts/API-Reference/requestmethod
     * @From:   https://github.com/aliyun-UED/aliyun-sdk-js/blob/0e005fddf5cf4b1093f8cd41b6052d454ef8fba5/lib/util.js
     */
  utils.topEscape = (clearString) => {
    let x = 0;
    let output = '';
    const regex = /(^[a-zA-Z0-9-_.~]*)/;

    const clearStr = clearString.toString();

    while (x < clearStr.length) {
      const match = regex.exec(clearStr.substr(x));
      if (match != null && match.length > 1 && match[1] !== '') {
        output += match[1];
        x += match[1].length;
      } else {
        if (clearStr[x] === ' ') {
          output += '%20';
        } else {
          const charCode = clearStr.charCodeAt(x);
          const hexVal = charCode.toString(16);
          output += '%' + (hexVal.length < 2
            ? '0'
            : '') + hexVal.toUpperCase();
        }
        x += 1;
      }
    }

    return output;
  };

  /**
     * 转换对象为数据
     *
     * @param object
     * @returns {Array}
     */
  utils.objToArray = (object) => {
    const array = [];
    const obje = object || {};

    if (typeof object !== 'object') {
      console.log('type err');
    }

    for (const key in obje) {
      array.push(key + '=' + utils.topEscape(obje[key]));
    }

    return array;
  };

  /**
     * 对数组根据其首字母进行排序
     *
     * @param arr
     * @returns {*}
     */
  utils.sortArray = (arr) => {
    arr.sort((a, b) => {
      return a.toLowerCase() < b.toLowerCase()
        ? -1
        : 1;
    });

    return arr;
  };

  /**
     * 根据 HMAC-SHA1 算法生成签名字符串
     *
     * @param string
     * @param secret
     * @returns {string}
     */
  utils.hMacSha1 = (string, secret) => {
    const sha1 = crypto.createHmac('sha1', secret);
    sha1.update(string);
    return utils.topEscape(sha1.digest('base64'));
  };

  /**
     * 根据 IOS-8601标准 格式化日期
     *
     * @param date
     * @param fmt
     * @returns {string}
     */
  utils.formatDate = (date, fmt) => {
    fmt = fmt || '%Y-%M-%dT%H:%m:%sZ';

    function pad(value) {
      return (value.toString().length < 2)
        ? '0' + value
        : value;
    }

    return fmt.replace(/%([a-zA-Z])/g, (_, fmtCode) => {
      switch (fmtCode) {
        case 'Y':
          return date.getUTCFullYear();
        case 'M':
          return pad(date.getUTCMonth() + 1);
        case 'd':
          return pad(date.getUTCDate());
        case 'H':
          return pad(date.getUTCHours());
        case 'm':
          return pad(date.getUTCMinutes());
        case 's':
          return pad(date.getUTCSeconds());
        default:
          throw new Error(`Unsupported format code: ${fmtCode}`);
      }
    });
  };

  /**
     * 根据规范构造用于计算签名的字符串
     *
     * @param args
     * @returns {string|*}
     */
  utils.getStringToSign = (args) => {
    // 符号编码
    function percentEncode(str) {
      return str.replace('/', '%2F');
    }
    // 排序后的字符串
    const queryString = utils.sortArray(args.queryArray).join('&');
    const stringToSign = `${args.httpMethod}&${percentEncode('/')}&${percentEncode(utils.topEscape(queryString))}`;

    return stringToSign;
  };

  /**
     * 生成查询对象
     *
     * @param queryObj
     * @returns {{httpMethod: string, queryArray: (Array|*)}}
     */
  protectedP.getQueryObject = (queryObj) => {
    const httpMethod = 'GET';
    const date = new Date();

    const paramsObj = {
      SignatureVersion: '1.0',
      SignatureMethod: 'HMAC-SHA1',
      Fommat: defaults.format,
      Version: defaults.version,
      AccessKeyId: defaults.accessid,
      Timestamp: utils.formatDate(date),
      SignatureNonce: Math.round(Math.random() * 1000000)
    };

    extend(paramsObj, queryObj);

    const queryArray = utils.objToArray(paramsObj);

    return {
      httpMethod,
      queryArray };
  };

  /**
     * 生成签名字符串
     *
     * @param args
     * @returns {string}
     */
  protectedP.getSignatureString = (args) => {
    const stringToSign = utils.getStringToSign(args);

    return utils.hMacSha1(stringToSign, `${defaults.accesskey}&`);
  };

  /**
     * 生成查询字符串
     *
     * @param params
     * @returns {string}
     */
  obj.getQueryString = (params) => {
    const queryObject = protectedP.getQueryObject(params);
    const signature = protectedP.getSignatureString(queryObject);
    // console.log(signature);

    return `http://${defaults.host}/?Signature=${signature}&${queryObject.queryArray.join('&')}`;
  };

  return obj;
};

module.exports = aliyun;
