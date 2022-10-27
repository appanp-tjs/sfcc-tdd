'use strict'
var exports = {};

exports.getSiteLevelFile = function() {
    var Site = require('dw/system/Site');
    var siteLevelFileName = 'testsuites_' + Site.current.getID().replace('-','_') + '.json';
    return siteLevelFileName;
}

exports.getSiteLevelTestSuites = function() {
    var LogError = require('*/cartridge/scripts/lib/LogError');
    var siteLevelTestSuites = [];
    try {
        siteLevelTestSuites = require('*/cartridge/scripts/' + exports.getSiteLevelFile());
    } catch (e) {
        LogError('No Site Level Tests Found or Configured: ', e);
    }
    return siteLevelTestSuites;
}

exports.appendSiteLevelTests = function(listOfTestSuites, listOfSiteLevelTestSuites) {
    for (var x = 0; x < listOfSiteLevelTestSuites.length; x++) {
        var testToAdd = listOfSiteLevelTestSuites[x];
        listOfTestSuites.push(testToAdd);
    }
}

module.exports = exports;