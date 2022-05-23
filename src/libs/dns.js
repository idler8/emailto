const dns = require('node:dns').promises;
const { verify } = require('./dkim.js');
dns.setServers([ '8.8.8.8', '114.114.114.114', '223.5.5.5', '223.6.6.6' ]);
module.exports = function({ domainName, keySelector, privateKey }) {
  return Promise.all([
    dns.resolveTxt(keySelector + '._domainkey.' + domainName),
    dns.resolveTxt('_dmarc.' + domainName),
    dns.resolveTxt(domainName),
    dns.resolveMx(domainName),
    dns.resolve(domainName)
  ]).catch(e => {
    console.log(e);
    return [ [], [], [], [], [] ];
  }).then(res => {
    if (res.some(e => !e?.[0])) return Promise.reject('缺少DNS记录');
    if (!res[0][0][0]) return Promise.reject('缺少DNS.KEY记录');
    const domainKey = res[0][0].join('');
    const dkimKey = domainKey.split('; p=')[1];
    return verify({ privateKey, dkimKey });
  });
};