const nodemailer = require('nodemailer');
const delayFunction = require('../utils/asyncDelay.js')(1000);
const transporter = nodemailer.createTransport({ logger: true, sendmail: true, secure: false });
const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
const Cache = {};
exports.options = function(obj) {
  Object.assign(Cache, obj);
};
exports.verify = function(params = {}) {
  if (!Cache.dkim || !Cache.from) throw '系统还未准备好';
  const { to, subject, text, html, attachments } = params;
  if (!regEmail.test(to)) throw '错误的目标地址';
  if (!subject) throw '缺少标题';
  if (!text && !html) throw '缺少正文';
  if (attachments?.length > 0 && attachments.some(({ filename, path }) => !filename || !path || path.indexOf('http') !== 0)) {
    throw '附件结构不正确';
  }
  return Object.assign({ to, subject, text, html, attachments }, Cache);
};
exports.send = function(message, delay) {
  console.log('准备发送邮件');
  return delayFunction(() => transporter.sendMail(message), delay);
};