"use strict";

var _ = require("lodash"),
    util = require("util");

var debug = console.log;
if (util.debuglog !== undefined) {
    debug = util.debuglog("s3-promise");
}

var aws = require("aws-sdk"),
    Promise = require("promise");

module.exports = function(option) {
    var s3 = option === null ? new aws.S3() : new aws.S3(option);
    var extend = {
        CopyObject: function (param) {
            function doCopyObject(ok, grr) {
                var cpReq = s3.copyObject(param)
                    .on("success", function(data) {
                        ok(param);
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                cpReq.send();
            }
            return new Promise(doCopyObject);
        },

        GetObject: function(param, extra) {
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
                if (extra && extra.timeout !== undefined) {
                    setTimeout(getReq.abort.bind(getReq), timeout);
                }
                if (extra && extra.debug === true) {
                    getReq.on("httpDownloadProgress", function(progress) {
                        debug("GetObject:", progress);
                    });
                }
                getReq.send();
            }
            return new Promise(doGetObject);
        },

        PutObject: function(param, extra) {
            function doPutObject(ok, grr) {
                var putReq = s3.putObject(param)
                    .on("success", function() {
                        ok(param);
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                if (extra && extra.timeout !== undefined) {
                    setTimeout(putReq.abort.bind(putReq), timeout);
                }
                if (extra && extra.debug === true) {
                    putReq.on("httpUploadProgress", function(progress) {
                        debug("PutObject:", progress);
                    });
                }
                putReq.send();
            }
            return new Promise(doPutObject);
        },

        DeleteObjects: function(param, extra) {
            // best effort remove delete old video
            function doDeleteObjects(ok, grr) {
                var delReq = s3.deleteObjects(param)
                    .on("success", function(data) {
                        ok(param);
                    })
                    .on("error", function(err) {
                        grr(err);
                    });
                if (extra && extra.timeout !== undefined) {
                    setTimeout(delReq.abort.bind(delReq), timeout);
                }
                delReq.send(); // fire away;
            }
            return new Promise(doDeleteObjects);
        }
    };
    _.assign(s3, extend);
    return s3;
};
