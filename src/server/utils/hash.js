const crypto = require('crypto');

function hashAlgorithm(text, type = 'md5'){
  let hash_obj = crypto.createHash(type);
  hash_obj.update(text + 'dmedglobal');
  let hashCode = hash_obj.digest('hex');
  console.log('hashCode:', hashCode);
  return hashCode;
}

module.exports = { hashAlgorithm }
