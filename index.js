"use strict";

var _ = require("lodash");

var aws = require("aws-sdk"),
    s3Promise = require("./s3"),
    lambdaPromise = require("./lambda"),
    etPromise = require("./et");

module.exports = function(options) {
    _.assign(aws.config, options);

    function makecfg(opts) {
        if (opts !== undefined) {
            return new aws.Config(opts);
        } else {
            return null;
        }
    }

    return {
        config: aws.config,

        S3: function(opts) {
            return s3Promise(makecfg(opts));
        },

        Lambda: function(opts) {
            return lambdaPromise(makecfg(opts));
        },

        ElasticTranscoder: function(opts) {
            return etPromise(makecfg(opts));
        }
    };
};
