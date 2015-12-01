'use strict';


module.exports = {

    'facebookAuth' : {
        'clientID'      : '1644709235772142', // your App ID
        'clientSecret'  : 'e3034764667aef8ceb4219964538ab16', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    }

    /*'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    }
     */,

    'googleAuth' : {
        'clientID'      : '684112185455-0p7of8kethov9hp8osbouop1mrncfnii.apps.googleusercontent.com',
        'clientSecret'  : 'uV-47cPkmubiEmmQ-BQpkL50',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};