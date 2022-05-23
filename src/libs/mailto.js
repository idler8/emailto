const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({ logger: true, sendmail: true, secure: false });

module.exports = (function(promise) {
  return function(message, delay) {
    promise = promise.then(() => {
      return transporter.sendMail(message);
    }).catch((e) => {
      console.log(e);
    }).then(() => new Promise(resolve => setTimeout(resolve, delay)));
  };
})(Promise.resolve());