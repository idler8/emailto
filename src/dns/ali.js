const { RR, DOMAIN, KEY, DMARC } = require('../config.js');
const localip = require('../libs/localip.js');
const Core = require('@alicloud/pop-core');
const endpoint = 'https://alidns.cn-hangzhou.aliyuncs.com';
const apiVersion = '2015-01-09';
const lock = require('../utils/asyncLock.js')('ali', 10000, 30000);
module.exports = async function({ privateKey, dkimKey }, accessKeyId = process.env.ALI_KEY, accessKeySecret = process.env.ALI_SECRET) {
  console.log('调用DNS_ALI');
  return await lock(async function() {
    console.log('更换DNS开始');
    const client = new Core({ accessKeyId, accessKeySecret, endpoint, apiVersion });
    const domainName = (RR || '@') + '.' + DOMAIN;
    const ip = await localip();
    await Promise.all([
      { DomainName: DOMAIN, RR: RR || '@' },
      { DomainName: DOMAIN, RR: RR ? '_dmarc.' + RR : '_dmarc', Type: 'TXT' },
      { DomainName: DOMAIN, RR: RR ? KEY + '._domainkey.' + RR : KEY + '._domainkey', Type: 'TXT' }
    ].map(e => client.request('DeleteSubDomainRecords', e, { method: 'POST' })));
    console.log('删除DNS成功');
    await client.request('OperateBatchDomain', {
      Type: 'RR_ADD',
      DomainRecordInfo: [
        { Domain: DOMAIN, Rr: RR || '@', Type: 'A', Value: ip },
        { Domain: DOMAIN, Rr: RR || '@', Type: 'MX', Value: domainName, Priority: 10 },
        { Domain: DOMAIN, Rr: RR || '@', Type: 'TXT', Value: 'v=spf1 ip:' + ip + ' ~all' },
        { Domain: DOMAIN, Rr: RR ? '_dmarc.' + RR : '_dmarc', Type: 'TXT', Value: 'v=DMARC1; p=' + DMARC },
        { Domain: DOMAIN, Rr: RR ? KEY + '._domainkey.' + RR : KEY + '._domainkey', Type: 'TXT', Value: dkimKey }
      ]
    }, { method: 'POST' });
    console.log('配置DNS成功');
    return { domainName, keySelector: KEY, privateKey };
  });
};