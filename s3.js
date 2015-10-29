"use strict";

var _ = require("lodash");

var aws = require("aws-sdk"),
    Promise = require("promise");

module.exports = function(option) {
    var s3 = option === null ? new aws.S3() : new aws.S3(option);
    var extend = {
        CopyObject: function (param) {
            function doCopyObject(ok, grr) {
                var cpReq = s3.copyObject(param)
                    .on("success", function(data) {
                        ok();
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                cpReq.send();
            }
            return new Promise(doCopyObject);
        },

        GetObject: function (param) {
            function doGetObject(ok, grr) {
                var getReq = s3.getObject(param)
                    .on("success", function(data) {
                        if (data.data.ContentType === "application/json") {
                            ok(JSON.parse(data.data.Body));
                        } else {
                            ok(data.data.Body);
                        }
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                setTimeout(getReq.abort.bind(getReq), 5 * 1000);
                getReq.send();
            }
            return new Promise(doGetObject);
        },

        PutObject: function(param) {
            function doPutObject(ok, grr) {
                var putReq = s3.putObject(param)
                    .on("success", function() {
                        ok(param);
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                setTimeout(putReq.abort.bind(putReq), 5 * 1000);
                putReq.send();
            }
            return new Promise(doPutObject);
        },

        DeleteObjects: function(param) {
            // best effort remove delete old video
            function doDeleteObjects(ok, grr) {
                var delReq = s3.deleteObjects(param)
                .on("success", function(data) {
                    ok(param);
                })
                .on("error", function(err) {
                    grr(err);
                });

                delReq.send(); // fire away;
            }
            return new Promise(doDeleteObjects);
        }
    };
    _.assign(s3, extend);
    return s3;
};
