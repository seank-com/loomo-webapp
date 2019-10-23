
var crypto = require('crypto');

function initialCap(str) {
  return str.slice(0,1).toUpperCase() + str.slice(1);
};

function getErrMsgs(err) {
  var msgs = [{class: 'box-danger', text: err.message}];
  if (process.env['NODE_ENV'] === 'development') {
    msgs.push({ class: 'box-danger', text: err.stack });
  }
  return msgs;
}

function uuidgen() {
    var i = 0,b = [];
    for (var x of crypto.randomBytes(16)) {
        b.push((0x100 + x).toString(16).substr(1));
        i += 1;
        if (i === 4 || i === 6 || i === 8 || i === 10)
            b.push('-');
    }
    return b.join('');
}

if (!String.prototype.format) {
  String.prototype.format = function () {
      "use strict";

      var args = arguments;
      return this.replace(/\{(\d+)\}/g, function (match, number) {
          var result = args[number] || match;
          return result;
      });
  };
}

module.exports.initialCap = initialCap;
module.exports.getErrMsgs = getErrMsgs;
module.exports.uuidgen = uuidgen;


