const { FROM, DELAY, PORT, AUTO } = require('./config.js');
const dns = require('./libs/dns.js');
const mailto = require('./libs/mailto.js');
const { generate } = require('./libs/dkim.js');

const express = require('express');
const app = express();
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.get('/health', async function(req, res) {
  if (!app.locals.dkim) {
    app.locals.STATE = false;
    res.json('EMPTY');
  } else {
    app.locals.STATE = await dns(app.locals.dkim);
    res.json('OK');
  }
});
app.post('/dkim/ali', async function(req, res) {
  if (app.locals.LOCKED) {
    const sec = ~~((app.locals.LOCKED - Date.now()) / 1000);
    if (sec > 0) return res.json({ '_error': { 'message': '请稍后再试（' + sec + 's）' }});
  }
  app.locals.LOCKED = Date.now() + 10000;
  app.locals.dkim = await require('./dns/ali.js')(generate(), req.body.accessKeyId, req.body.accessKeySecret);
  app.locals.LOCKED = Date.now() + 300000;
  res.end('OK');
});
const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
app.post('/mailto', function(req, res) {
  if (!app.locals.STATE) return res.json({ '_error': { 'message': '系统准备中' }});
  const { to, subject, text, html, attachments } = req.body;
  if (!regEmail.test(to)) return res.json({ '_error': { 'message': '错误的目标地址' }});
  if (!subject) return res.json({ '_error': { 'message': '缺少标题' }});
  if (!text && !html) return res.json({ '_error': { 'message': '缺少正文' }});
  if (attachments?.length > 0 && attachments.some(({ filename, path }) => !filename || !path || path.indexOf('http') !== 0)) {
    return res.json({ '_error': { 'message': '附件结构不正确' }});
  }
  mailto({ from: FROM, to, subject, text, html, attachments, dkim: app.locals.dkim }, DELAY);
  return res.end('OK');
});

app.listen(PORT);

(async function() {
  if (!AUTO) return;
  app.locals.LOCKED = Date.now() + 10000;
  app.locals.dkim = await require('./dns/ali.js')(generate());
  app.locals.LOCKED = Date.now() + 300000;
})();