const os = require('os');
const crypto = require('crypto');
const DNS_DKIM = 'v=DKIM1; h=sha256; k=rsa; t=s; p=';
const modulusLength = 1024;
const publicKeyEncoding = { type: 'spki', format: 'pem' };
const privateKeyEncoding = { type: 'pkcs8', format: 'pem' };
const openssl = { modulusLength, publicKeyEncoding, privateKeyEncoding };
exports.generate = function() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', openssl);
  const dkimKey = DNS_DKIM + publicKey.replaceAll(os.EOL, '').replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '');
  return { publicKey, privateKey, dkimKey };
};
exports.verify = function({ privateKey, dkimKey }) {
  const publicKey = [ '-----BEGIN PUBLIC KEY-----', ...dkimKey.replace(/(.{64})/g, '$1' + os.EOL).split(os.EOL), '-----END PUBLIC KEY-----' ].filter(Boolean).join(os.EOL);
  const randomKey = Math.random().toFixed(8);
  const crypted = crypto.publicEncrypt(publicKey, Buffer.from(randomKey, 'utf8'));
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(crypted.toString('hex'), 'hex'));
  return decrypted.toString('utf8') === randomKey;
};