module.exports = function(app, passport) {

    // route for home page
    app.get('/', function(req, res) {
        res.render('index');// load the index.ejs file
    });

    app.get('/partials/:name', function (req, res) {
        var name = req.params.name;
        res.render('partials/' + name);
    });



    app.get('/auth/isAuthenticated', ensureAuthentication);

    app.get('/profile', ensureAuthentication, function(req, res) {

    });

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }), function(){
        console.log('facebook');
    });

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));

    // route for logging out
    app.get('/auth/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('*', function(req, res){
        res.render('index');
    })

};

// route middleware to make sure a user is logged in
function ensureAuthentication(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        res.send(req.user);
        //return next();
    }
    else{
        console.log("CENASSASADASDA");
        res.sendStatus(401);
    }


}