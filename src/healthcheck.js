const PORT = process.env.PORT || 80;
const request = require('request');
request('http://localhost:' + PORT, function(error, response, body) {
  console.log(body);
});