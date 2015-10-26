"use strict";

var _ = require("lodash");

var aws = require("aws-sdk"),
    Promise = require("promise");

module.exports = function(option) {
    var et = option === null ? new aws.ElasticTranscoder() : new aws.ElasticTranscoder(option);
    var extend = {
        CancelJobReq: function (jobId) {
            function doCancelETJobReq(ok, grr) {
                var req = et.cancelJob({Id: jobId})
                    .on("success", function() {
                        ok();
                    })
                    .on("error", function(err) {
                        if (err.statusCode === 409) {
                            ok();
                        } else {
                            grr(err);
                        }
                    });

                req.send(); // fire away
            }
            return new Promise(doCancelETJobReq);
        }
    };
    _.assign(et, extend);
    return et;
};
