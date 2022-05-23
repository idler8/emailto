exports.PORT = process.env.PORT || 80;
exports.DELAY = (process.env.DELAY * 1 || 0) + 1000;
exports.KEY = process.env.KEY || 'mail';
exports.RR = process.env.RR;
exports.DOMAIN = process.env.DOMAIN;
exports.FROM = (function(FROM) {
  return FROM.indexOf('@') !== -1 ? FROM : FROM + '@' + [ exports.RR, exports.DOMAIN ].filter(Boolean).join('.');
})(process.env.FROM || 'noreply');
exports.AUTO = process.env.AUTO;
exports.DMARC = 'none';
exports.SPF = '+all';