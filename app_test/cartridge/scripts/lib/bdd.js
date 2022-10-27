var currentCategory;
var currentBefore;
var currentAfter;
var currentBeforeEach;
var currentAfterEach;

//Test has dependency on service call result
var DEPENDS_ON_SERVICE = 'Service';
//Test has dependency on specific configuration like SitePreference or a Custom Object
var DEPENDS_ON_CONFIGURATION = 'Configuration';
//Test has dependency on a DW object like Customer or Order 
var DEPENDS_ON_DATA = 'Data'; 

var suite = require('/app_test/cartridge/scripts/lib/TestSuiteBase');
suite.tests = [];

function describe(name, func) {
    currentCategory = name;

    func();

    var tests = suite.tests.filter(function (test) {
        return ((test.category === currentCategory) && (!test.skip));
    });

    if (tests.length) {
        tests[0].before = currentBefore;
        tests[tests.length - 1].after = currentAfter;
    }

    currentCategory = null;
    currentBefore = null;
    currentAfter = null;
    currentBeforeEach = null;
    currentAfterEach = null;

    suite.name = name;

    return suite;
}

function it(name, func, dependsOn) {
    var test = createTest(name, func, false, dependsOn);

    if (name) {
        suite.tests.push(test);
    }
    return {
        expectedError: function (expectedError) {
            test.expectedError = expectedError;
        }
    }
}


it.skip = function (name, func, dependsOn) {
    suite.tests.push(createTest(name, func, true, dependsOn));
}

function beforeEach(func) {
    if (func) {
        currentBeforeEach = func;
    }
}

function afterEach(func) {
    if (func) {
        currentAfterEach = func;
    }
}

function before(func) {
    if (func) {
        currentBefore = func;
    }
}

function after(func) {
    if (func) {
        currentAfter = func;
    }
}

function createTest(name, func, skip, dependsOn) {
    var test = {
        'name': name,
        'run': func,
        'skip': skip,
        'category': currentCategory,
        'beforeEach': currentBeforeEach,
        'afterEach': currentAfterEach,
        'dependsOn' : dependsOn
    };
    return test;
}

module.exports.describe = describe;
module.exports.it = it;
module.exports.beforeEach = beforeEach;
module.exports.afterEach = afterEach;
module.exports.before = before;
module.exports.after = after;
module.exports.dependsOn = {
    SERVICE: DEPENDS_ON_SERVICE,
    CONFIGURATION: DEPENDS_ON_CONFIGURATION,
    DATA: DEPENDS_ON_DATA
};
