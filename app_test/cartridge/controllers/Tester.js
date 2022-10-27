'use strict';

var server = require('server');

/**
 * This action will render all the test suites that are configured in the 'tests.json' file
 */
server.get('Start', function (req, res, next) {
    var System = require('dw/system/System');
    var siteLevelTestsHelpers = require('*/cartridge/scripts/helpers/siteLevelTestsHelpers.js');

    var listOfTestSuites;
    var listOfSiteLevelTestSuites;
    var params = req.querystring;
    var containsSiteLevelTests = false;
    if (System.getInstanceType() === System.PRODUCTION_SYSTEM) {
        return next(new Error('Tests cannot be run on production instance!'));
    }

    var LogError = require('*/cartridge/scripts/lib/LogError');

    try {
        listOfTestSuites = require('*/cartridge/scripts/testsuites.json');
    } catch (e) {
        LogError('Tester-Start', e);
        return next(new Error(e));
    }
    listOfSiteLevelTestSuites = siteLevelTestsHelpers.getSiteLevelTestSuites();
    if ((listOfTestSuites && listOfTestSuites.length > 0) && (listOfSiteLevelTestSuites && listOfSiteLevelTestSuites.length > 0)) {
        containsSiteLevelTests = true;
        if (params.siteonly && params.siteonly === 'true') {
            listOfTestSuites = listOfSiteLevelTestSuites;
        } else {
            siteLevelTestsHelpers.appendSiteLevelTests(listOfTestSuites, listOfSiteLevelTestSuites);
        }
    }

    res.render('displayTestSuites', {
        ListOfTestSuites: listOfTestSuites,
        containsSiteLevelTests: containsSiteLevelTests
    });
    next();
});

/**
 * This action will display the tests for a test suite in a table
 */
server.get('DisplaySuite', function (req, res, next) {
    var System = require('dw/system/System');
    var suite;
    var params = req.querystring;
    if (System.getInstanceType() === System.PRODUCTION_SYSTEM) {
        return next(new Error('Tests cannot be run on production instance!'));
    }

    var LogError = require('*/cartridge/scripts/lib/LogError');
    var TestSuiteMgr = require('*/cartridge/scripts/lib/TestSuiteMgr');
    var path;
    try {
        path = TestSuiteMgr.getModulePath(params.suite);
        suite = TestSuiteMgr.get(params.suite, params.containsSiteLevelTests);
    } catch (e) {
        if (e.message.indexOf(path) !== -1) {
            // test suite not found, return empty suite
            suite = {
                name: params.suite,
                error: 'Test file "' + path + '" is not present in current code version'
            };
        } else {
            LogError('Tester-DisplaySuite', e);
            return next(new Error(e));
        }
    }

    res.render('displayTestSuite', {
        TestSuite: suite,
        TestSuiteID: params.suite
    });
    next();
});

/**
 * This action will run a test
 */
server.get('Run', function (req, res, next) {
    var System = require('dw/system/System');
    var testSuite;
    if (System.getInstanceType() === System.PRODUCTION_SYSTEM) {
        return next(new Error('Tests cannot be run on production instance!'));
    }

    var LogError = require('*/cartridge/scripts/lib/LogError');
    var TestSuiteMgr = require('*/cartridge/scripts/lib/TestSuiteMgr');

    var suite = req.querystring.suite;
    var testToRun = parseInt(req.querystring.testid, 10);
    var path;
    try {
        path = TestSuiteMgr.getModulePath(suite);
        testSuite = TestSuiteMgr.get(suite).run(testToRun);
    } catch (e) {
        if (e.message.indexOf(path) !== -1) {
            // test suite not found, return single skipped test
            testSuite = {
                name: suite,
                failures: 0,
                totalElapsed: 0.0,
                tests: [{
                    category: suite,
                    name: 'Test file "' + path + '" is not present in current code version, skipping',
                    failed: false,
                    skipped: true,
                    elapsed: 0.0
                }]
            };
        } else {
            LogError('Tester-Run', e);
            return next(new Error(e));
        }
    }

    if ('format' in req.querystring && req.querystring.format === 'xml') {
        res.render('returnXML', {
            TestSuite: testSuite
        });
    } else {
        res.render('returnJSON', {
            Result: JSON.stringify(testSuite)
        });
    }
    next();
});

module.exports = server.exports();
