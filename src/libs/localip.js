
const { default: axios } = require('axios');
module.exports = async function() {
  return axios.get('http://ipv4.lookup.test-ipv6.com/ip/').then(res => res?.data?.ip);
};