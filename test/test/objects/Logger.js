const TimelineReporter = require('wdio-timeline-reporter').default

class Logger {
    get startLogPattern () { return '\t=> '}

    log (stringToLog) {
        console.log (this.startLogPattern + stringToLog)
        TimelineReporter.addContext({
            title: 'Logger',
            value: stringToLog
        })
    }
}

module.exports = new Logger()
