const { FROM, DELAY, PORT, AUTO, RUN } = require('./config.js');
const { generate } = require('./libs/dkim.js');
const mailto = require('./libs/mailto.js');
const doTry = require('./utils/asyncTry.js')((e, res) => e ? res.json({ '_error': { 'message': e }}) : res.end('OK'));

const express = require('express');
const app = express();
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.get('/health', (req, res) => res.json('OK'));
app.post('/dkim/ali', async function(req, res) {
  const { accessKeyId, accessKeySecret } = req.body;
  doTry(async function() {
    await mailto.options({ from: FROM, dkim: await require('./dns/ali.js')(generate(), accessKeyId, accessKeySecret) });
  }, res);
});
app.post('/mailto', function(req, res) {
  doTry(async function() {
    await mailto.send(mailto.verify(req.body), DELAY);
  }, res);
});
app.listen(PORT);

(async function() {
  if (AUTO) mailto.options({ from: FROM, dkim: await require('./dns/ali.js')(generate()) });
  if (RUN) {
    const delayFunction = require('./utils/asyncDelay.js')(1000);
    require('./utils/asyncRecursion.js')(function() {
      console.log('准备获取数据');
      return delayFunction(() => {
        const axios = require('axios');
        console.log('开始获取数据');
        return axios({ method: 'GET', url: RUN }).then(res => mailto.send(mailto.verify(res.data), DELAY));
      }, DELAY);
    })();
  }
})();