/*var express = require('express');
 var router = express.Router();


 /!* GET home page. *!/
 router.get('/', function(req, res, next) {
 //res.render('index', { title: 'Express J' })
 res.sendFile('index.html', { root: __dirname });
 });

 module.exports = router;
 */


/*
exports.index = function(req, res){
  res.render('index');
};
*/

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

/*
exports.login = function(req, res) {

  // render the page and pass in any flash data if it exists
  res.render('login', { message: req.flash('loginMessage') });

};

exports.signup = function(req, res) {

  // render the page and pass in any flash data if it exists
  res.render('signup', { message: req.flash('signupMessage') });
};

exports.facebook = function(req, res, passport){
  passport.authenticate('facebook', { scope : 'email' });
}

exports.facebookCB = function(req, res, passport){
  app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));
}*/

