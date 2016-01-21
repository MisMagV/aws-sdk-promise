"use strict";

var _ = require("lodash"),
    util = require("util");

var debug = console.log;
if (util.debuglog !== undefined) {
    debug = util.debuglog("cognito-promise");
}

var aws = require("aws-sdk"),
    Promise = require("promise");

var SocialLogins = {
    "Facebook": "graph.facebook.com",
    "Google": "accounts.google.com",
    "Twitter": "api.twitter.com",
    "Amazon": "www.amazon.com",
    "Digits": "www.digits.com",

    "Origin": "cognito-identity.amazonaws.com",
};

module.exports = function(option) {
    var ci = option === null ? new aws.CognitoIdentity() : new aws.CognitoIdentity(option);
    return _.assign(ci, {
        NewLogins: function(domain, token) {
            var origin = SocialLogins[domain];
            if (!origin) {
                throw new Error("invalid authority domain");
            } else {
                var Logins = {};
                Logins[origin] = token;
                return Logins;
            }
        },

        GetOpenIdTokenForDeveloperIdentity: function(params) {
            function doGetToken(ok, grr) {
                ci.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
                    if (err) {
                        grr(err);
                    } else {
                        ok(data);
                    }
                });
            }
            return new Promise(doGetToken);
        },

        GetCredentials: function(params) {
            function doGetCredentials(ok, grr) {
                var cred = new aws.CognitoIdentityCredentials({
                    IdentityPoolId: params.IdentityPoolId,
                    IdentityId: params.IdentityId,
                    Logins: params.Logins,
                });
                cred.refresh(function(err) {
                    if (err) {
                        grr(err);
                    } else {
                        ok(cred);
                    }
                });
            }
            return new Promise(doGetCredentials);
        },

    });
};
