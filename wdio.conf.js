const { TimelineService } = require('wdio-timeline-reporter/timeline-service')
const TimelineReporter = require('wdio-timeline-reporter').default
// const colors = require('colors/safe');

exports.config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
  // on a remote machine).
  runner: 'local',
  // //
  featureFlags: {
    specFiltering: true
  },
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  // specs: ['./test/test/specs/**/*.js'],

  suites: {
    // Generics: [
    // './test/test/specs/generics/cohort360-SCG00-LoginLogout.js' //ok
    // './test/test/specs/generics/cohort360-SCG01-LeftMenu.js' //ok
    // './test/test/specs/generics/cohort360-SCG02-PatientContextBar.js' //ok
    // ],
    // HomePage: ['./test/test/specs/pages/cohort360-SCP01-HomePage.js //ok']
    MyPatients: [
      './test/test/specs/pages/cohort360-SCP02-MyPatientsPage.js'
      // './test/test/specs/pages/cohort360-SCP03-MyPatientDatasPage.js',
      // './test/test/specs/pages/cohort360-SCP04-MyPatientDocumentsPage.js',
      // './test/test/specs/pages/cohort360-SCP05-MyPatientSearchPage.js',
      // './test/test/specs/filters/cohort360-SCF01-PatientListFilter.js',
      // './test/test/specs/filters/cohort360-SCF02-PatientListSearchFilter.js',
      // './test/test/specs/filters/cohort360-SCF03-DocumentListSortFilter.js',
      // './test/test/specs/filters/cohort360-SCF04-DocumentListFilter.js',
      // './test/test/specs/filters/cohort360-SCF05-DocumentListSearchFilter.js'
    ]
    // Requests: [
    //     './test/test/specs/pages/cohort360-SCP06-MyResearchProjectsPage.js',
    //     // './test/test/specs/pages/cohort360-SCP07-NewCohortPage.js',
    //     './test/test/specs/requests/cohort360-SCR00-CreateResearchProject.js',
    //     './test/test/specs/requests/cohort360-SCR01-CreateRequest.js',
    //     './test/test/specs/requests/cohort360-SCR99-DeleteResearchProject.js'
    // ]
  },

  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [
    {
      // maxInstances can get overwritten per capability. So if you have an in-house Selenium
      // grid with only 5 firefox instances available you can make sure that not more than
      // 5 instances get started at a time.
      maxInstances: 1,
      //
      browserName: 'chrome',
      // browserName: 'firefox',
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        args: ['--no-sandbox', '--disable-infobars', '--headless', '--disable-gpu', '--window-size=1440,735']
        // args: ['--no-sandbox', '--disable-infobars', /*'--headless',*/ '--disable-gpu', '--window-size=1440,735']
      }
      // If outputDir is provided WebdriverIO can capture driver session logs
      // it is possible to configure which logTypes to include/exclude.
      // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
      // excludeDriverLogs: ['bugreport', 'server'],
    }
  ],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'error',
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevels: {
    webdriver: 'error',
    webdriverio: 'error',
    '@wdio/cli': 'error',
    '@wdio/applitools-service': 'error',
    '@wdio/browserstack-service': 'error',
    '@wdio/devtools-service': 'error',
    '@wdio/sauce-service': 'error',
    '@wdio/mocha-framework': 'error',
    '@wdio/jasmine-framework': 'error',
    '@wdio/local-runner': 'error',
    '@wdio/sumologic-reporter': 'error',
    '@wdio/config': 'error',
    '@wdio/sync': 'error',
    '@wdio/utils': 'error'
  },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  //    baseUrl: '',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 90000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  services: [['chromedriver'], [TimelineService]],

  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  // framework: 'mocha',
  framework: 'jasmine',
  //
  // The number of times to retry the entire specfile when it fails as a whole
  // specFileRetries: 1,
  //
  // Delay in seconds between the spec file retry attempts
  // specFileRetriesDelay: 0,
  //
  // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
  // specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter.html
  reporters: [
    [
      'timeline',
      {
        outputDir: './reports',
        fileName: 'cohort360-timeline-report.html',
        embedImages: true,
        screenshotStrategy: 'before:click'
      }
    ]
  ],

  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  // Options to be passed to Jasmine.
  // jasmineNodeOpts: {
  //     //
  //     // Jasmine default timeout
  //     defaultTimeoutInterval: 90000,

  //     random: false
  // },
  jasmineOpts: {
    defaultTimeoutInterval: 1000000,
    random: false
  },
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: function (config, capabilities) {
  // },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // beforeSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // before: function (capabilities, specs) {
  // },
  before: function (capabilities, specs) {
    // browser.addLocatorStrategy('getNodeSameLevel', function (selector) {
    //    var nodes = document.querySelector(selector)
    //    return nodes
    // })

    var hr = ''
    for (i = 0; i < specs[0].length + 4; i++) hr = hr + '-'

    // console.log('\x1b[33m', '\033[1m', hr, '\033[0m');
    console.log('\x1b[1m\x1b[33m', hr, '\x1b[0m\x1b[0m')
    console.group()
    // console.log('\x1b[33m', '\033[1m', specs[0], '\033[0m')
    console.log('\x1b[1m\x1b[33m', specs[0], '\x1b[0m\x1b[0m')
    console.groupEnd()
    // browser.setWindowSize(1920, 1080)
    // browser.setWindowSize(1536, 864)
    // browser.setWindowSize(1440, 900)
    browser.setWindowSize(1366, 768)
    // console.log('\x1b[33m', '\033[1m', hr, '\033[0m');
    console.log('\x1b[1m\x1b[33m', hr, '\x1b[0m\x1b[0m')
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  /*beforeSuite: function (suite) {
        reporters: [['timeline', { fileName: 'cohort360-' + suite.description + '-timeline-report.html' }]]
    },*/
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  // beforeTest: function (test, context) {
  // },
  beforeTest: function (test) {
    // test.description = '@it ' + test.description;
    // console.log('-----------------------------------------------------------------------------------------------');
    console.group()
    console.log('\x1b[35m' + '@it' + '\x1b[0m', '\x1b[1m\x1b[36m' + test.description + '\x1b[0m\x1b[0m')
  },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function (test) {

  // },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */
  // afterHook: function (test, context, { error, result, duration, passed, retries }) {
  // },
  /**
   * Function to be executed after a test (in Mocha/Jasmine).
   */
  // afterTest: function(test, context, { error, result, duration, passed, retries }) {
  // },
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    console.log(
      '\x1b[35m' + '   ' + '\x1b[0m',
      '\x1b[1m' + (passed ? '\x1b[32m' : '\x1b[31m') + test.description + '\x1b[0m\x1b[0m',
      '===>',
      '\x1b[1m' + (passed ? '\x1b[32mPASSED' : '\x1b[31mFAILED') + '\x1b[0m\x1b[0m'
    )
    console.log('test', test)
    console.groupEnd()

    if (!passed) {
      const failedMatchers = test.failedExpectations.filter((element) => !element.passed)
      const testIsFailed = failedMatchers.length !== 0 || !passed
      // console.log('Test: ' + test.description + (testIsFailed ? ' => FAILED' : ' => PASSED'))

      if (testIsFailed) {
        // console.log('Saving screenshot for failed test ' + test.description);
        // get current test title and clean it, to use it as file name
        var filename = encodeURIComponent(test.fullName.replace(/\s+/g, '-'))
        browser.saveScreenshot('./reports/' + filename + '.png')
      }
    }

    if (error) {
      TimelineReporter.addContext('=> Error : ' + error.message + ' (See "Error Log" above for stack trace)')
      // TimelineReporter.addContext('=> ' + error.stack)
    }
  }

  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  // afterSuite: function (suite) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  // onComplete: function(exitCode, config, capabilities, results) {
  // },
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  //onReload: function(oldSessionId, newSessionId) {
  //}
}
