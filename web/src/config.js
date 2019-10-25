var debugConfig = require('debug')('config');

debugConfig("Checking configuration");

function ensureSetting(name) {
  if (!!process.env[name]) {
    if (process.env[name] !== "") {
      debugConfig(name + " = " + process.env[name]);
    } else {
      debugConfig(name + " missing, failing fast");
      process.exit(0);
    }
  } else {
    debugConfig(name + " missing, failing fast");
    process.exit(0);
  }
}

ensureSetting("BLOB_CONTAINER_URI_PATH");
ensureSetting("BLOB_SAS_QUERY_STRING");
ensureSetting("COGNITIVE_SERVICES_SUBSCRIPTION_KEY");
ensureSetting("COGNITIVE_SERVICES_FACE_DETECT_URI");

module.exports = true;