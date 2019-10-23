var cookieSession = require('cookie-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var crypto = require('crypto');

var admin = {
  id:1,   
  username: 'admin',
  hash: 'xi9q8bqXbKZb9encpIvHYn9gu9JnCDjM2Wj3tHG44B0=',
  avatar: '11.1-robot.png',
  fullname: 'Administrator',
  jobtitle: 'Digital Slave',
  createdAt: new Date(2019, 10, 22),
  updatedAt: Date.now()
};

function validateUser(username, password, done) {
  var hash = crypto.createHash('sha256').update(password).digest('base64');
  if (admin.username === username && admin.hash === hash) {
   return done(null, admin);
  } else {
   return done(null, false);
  }
}

function serializeUser(user, done) {
  done(null,admin.id);
}

function deserializeUser(id, done) {
  if (admin.id === id) {
    done(null, admin);
  } else {
    done(new Error("cannot deserialize user"))
  }
}

function init(app) {
  // cookies are used to remember who is logged in
  app.use(cookieSession({
    name: 'session',
    keys: ["boofoowho"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }));

  // configure auth
  app.use(passport.initialize());
  app.use(passport.session());

  // flash messaging
  app.use(flash());

  // passport config
  passport.use(new LocalStrategy(validateUser));
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
}

module.exports.init = init;





