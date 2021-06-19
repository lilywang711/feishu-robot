'use strict';
const crypto = require('crypto');

module.exports = (secret, timestamp) => {
  const signStr = timestamp + '\n' + secret;
  return crypto.createHmac('sha256', signStr).update('').digest('base64');
};
