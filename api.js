const urllib = require('urllib');
const xml2js = require('xml2js');

const api = (bundleInterface) => {
  const interFace = bundleInterface || {};
  const obj = {};

  obj.request = (params, callback) => {
    let callbackF;

    // callback
    if (callback && typeof callback === 'function') {
      callbackF = callback;
    } else {
      callbackF = (err, data) => {
        console.log(err, data);
      };
    }

    // queryString
    const queryString = interFace.getQueryString(params);

    urllib.request(queryString, {
      method: 'GET',
      headers: {
        ETAG: 'MT-NODE'
      }
    }, (err, data) => {
      if (err) {
        throw err;
        // callbackF(err, null);
        // return;
      }
      const xml = data.toString();
      // const parser = xml2js.Parser();
      // const json = parser.parseString(xml);
      // returns a string containing the JSON structure by default
      callbackF(null, JSON.parse(xml));
    });
  };

  return obj;
};

module.exports = api;
