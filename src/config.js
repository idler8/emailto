exports.PORT = process.env.PORT || 80;
exports.DELAY = (process.env.DELAY * 1 || 0) + 1000;
exports.KEY = process.env.KEY || 'mail';
exports.RR = process.env.RR;
exports.DOMAIN = process.env.DOMAIN;
exports.DMARC = process.env.DMARC || 'none';

exports.AUTO = process.env.AUTO;
exports.RUN = process.env.RUN;

exports.FROM = (function(FROM) {
  return FROM.indexOf('@') !== -1 ? FROM : FROM + '@' + [ exports.RR, exports.DOMAIN ].filter(Boolean).join('.');
})(process.env.FROM || 'noreply');