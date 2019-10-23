var express = require('express');
var utils = require('../utils/utils');
var crypto = require('crypto');
var https = require('https');
var path = require('path');
var fs = require('fs');
var timers = require('timers');
var url = require('url');

var router = express.Router();

function receiveBody(req, callback) {
  var chunks = [];

  req.on('error', callback);

  req.on('data', function(chunk) {
    chunks.push(chunk);
  });

  req.on('end', function() {
    var buffer = Buffer.concat(chunks);
    callback(null, buffer);
  });
}

function executeRequest(options, data, callback) {
  var req = https.request(options, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      callback(null, res);
    } else {
      // All other errors
      err = new Error("Bad statusCode " + res.statusCode);
      err.res = res;
      callback(err, null);
    }
  });
  req.on('error', callback);

  // Write data to request body
  req.write(data);
  req.end();  
}

function uploadBlob(name, data, datatype, callback) {
  var req = {},
  uri = process.env.BLOB_CONTAINER_URI_PATH + name +
  process.env.BLOB_SAS_QUERY_STRING,
  options = url.parse(uri);

  options.method = "PUT";
  options.headers = { 
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": datatype,
    "Content-Length": Buffer.byteLength(data)
  };

  executeRequest(options, data, callback);
}

function detectFace(imageURI, callback) {
  var req = {},
    uri = process.env.COGNITIVE_SERVICES_DETECT_FACE_URI,
    options = url.parse(uri),
    body = JSON.stringify({
      url: imageURI
    });
  
    options.method = "POST";
    options.headers = {
      "Ocp-Apim-Subscription-Key": process.env.COGNITIVE_SERVICES_SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    };

    executeRequest(options, body, callback);
  }

router.put('/recognize', function(req, res) {
  var uuid = utils.uuidgen(),
    name = uuid + ".jpg";

  receiveBody(req, function(err, buffer) {
    if (err) {
      res.status(500).json({ error: err.message});
    } else {
      uploadBlob(name, buffer, "image/jpeg", function(err, bres) {
        if (err) {
          res.status(500).json({
            error: err.message
          });
        } else {
          detectFace(process.env.BLOB_CONTAINER_URI_PATH + name, function(err, detectRes) {
            if (err) {
              res.status(500).json({error: err.message});
            } else {
              receiveBody(detectRes, function(err, buffer) {
                var jsonName = uuid + ".json";
                uploadBlob(jsonName, buffer.toString(), "application/json", function(err, bres) {
                  if (err) {
                    res.status(500),json({ error: err.message});
                  } else {
                    res.status(200).json({ id: uuid });
                  }
                });  
              });
            }
          });
        }
      });    
    }
  });
});

module.exports = router;
