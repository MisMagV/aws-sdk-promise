"use strict";

var _ = require("lodash"),
    util = require("util");

var debug = console.log;
if (util.debuglog !== undefined) {
    debug = util.debuglog("lambda-promise");
}

var aws = require("aws-sdk"),
    Promise = require("promise");

module.exports = function(option) {
    var lambda = option === null ? new aws.Lambda() : new aws.Lambda(option);
    var extend = {
        Invoke: function(param, extra) {
            function doInvoke(ok, grr) {
                var req = lambda.invoke(param)
                    .on("success", function(data) {
                        ok(data);
                    })
                    .on("error", function(err) {
                        debug("invoke: failed:", err);
                        grr(err);
                    });
                req.send();
            }
            return new Promise(doInvoke);
        }
    };
    _.assign(lambda, extend);
    return lambda;
};
