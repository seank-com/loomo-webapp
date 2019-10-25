var debugApi = require('debug')('api');

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

      debugApi("Bad statusCode " + res.statusCode);
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

  debugApi("uploading Blob " + name + " (" + Buffer.byteLength(data) + " bytes)");
  executeRequest(options, data, callback);
}

function detectFace(imageURI, callback) {
  var req = {},
    uri = process.env.COGNITIVE_SERVICES_FACE_DETECT_URI,
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

  debugApi("detecting face in " + imageURI);
  executeRequest(options, body, callback);
}

router.put('/recognize', function(req, res) {
  var uuid = utils.uuidgen(),
    name = uuid + ".jpg";

  receiveBody(req, function(err, buffer) {
    if (err) {
      debugApi("receiveBody failed: " + err.message);
      res.status(500).json({error: err.message});
    } else {
      uploadBlob(name, buffer, "image/jpeg", function(err, bres) {
        if (err) {
          debugApi("uploadBlob failed: " + err.message);
          res.status(500).json({error: err.message});
        } else {
          detectFace(process.env.BLOB_CONTAINER_URI_PATH + name, function(err, detectRes) {
            if (err) {
              detectFace("uploadBlob failed: " + err.message);
              res.status(500).json({error: err.message});
            } else {
              receiveBody(detectRes, function(err, buffer) {
                var jsonName = uuid + ".json";

                if (err) {
                  detectFace("receiveBody failed: " + err.message);
                  res.status(500).json({error: err.message});
                } else {

                  var results = JSON.parse(buffer.toString());
                    faces = results.map(x => x.faceId);

                  // {
                  //   "largePersonGroupId": "sample_group",
                  //   "faceIds": [
                  //       "c5c24a82-6845-4031-9d5d-978df9175426",
                  //       "65d083d4-9447-47d1-af30-b626144bf0fb"
                  //   ],
                  //   "maxNumOfCandidatesReturned": 1,
                  //   "confidenceThreshold": 0.5
                  // }

                  uploadBlob(jsonName, JSON.stringify(results, null, 2), "application/json", function(err, bres) {
                    if (err) {
                      detectFace("uploadBlob failed: " + err.message);
                      res.status(500),json({ error: err.message});
                    } else {
                      res.status(200).json({ id: uuid, faces: faces });
                    }
                  });  
                }
              });
            }
          });
        }
      });    
    }
  });
});

module.exports = router;
