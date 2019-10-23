var express = require('express');
var utils = require('../utils/utils');

var router = express.Router();

function loadContext(req, res, next) {
  // all user path require login
  if (!req.user) {
    req.flash('msgs', [{class: 'box-warning', text: 'You must be logged in!'}]);
    return res.redirect('/');
  } 

  if (req.path === '/') {
   res.locals.pictures = [];
   next();
  } else {
    if (req.path === '/add') {
      res.locals.title = 'Add Pictures';
      res.locals.actiontitle = 'Create'
      res.locals.icon = 'fa-plus';
      res.locals.description = "Please provide the initial values for this picture.";
      res.locals.add = true;
      res.locals.action = '/pictures/add';  
      next();
    } else {
      res.locals.title = 'Update Poster';
      res.locals.actiontitle = 'Save'
      res.locals.icon = 'fa-save';
      res.locals.description = "Make any changes you would like.";
      res.locals.add = false;
      res.locals.action = '/pictures/edit';
      res.locals.posterid = 'foo';
      next();
    }
  }
}

router.get('/', loadContext, function(req, res, next) {
  res.render('pictures/list', {});  
});

router.get('/add', loadContext, function(req, res) {
  res.render('pictures/add-edit', {});
});

router.get('/edit', loadContext, function(req, res) {
  res.render('pictures/add-edit', {});
});

module.exports = router;
