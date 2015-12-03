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

    // =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================


    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================



    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));



    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future


    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/');
        });
    });



    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/');
        });
    });


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
        res.sendStatus(401);
    }


}