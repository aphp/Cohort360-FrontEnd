const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Calendar = require("../objects/Calendar")

class DocumentDateFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(2)') }

    get titleValue () { return 'Date :' }
    get beforeDateLabelValue () { return 'Avant le :' }
    get afterDateLabelValue () { return 'Après le :' }
    get dateIntervalToSelect () { return COHORT360_PARAMS.DOCUMENT_DATE_FILTER_INTERVAL_LIST }

    get title () { return this.block.$('h3:nth-child(1)') }
    get beforeDateLabel () { return this.block.$('div:nth-child(3) > legend') }
    get afterDateLabel () { return this.block.$('div:nth-child(2) > legend') }
    get beforeDateInput () { return this.block.$('div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > input:nth-child(1)') }
    get afterDateInput () { return this.block.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > input:nth-child(1)') }

    get beforeDateCalendarButton () { return this.block.$('div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)') } 
    get afterDateCalendarButton () { return this.block.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)') } 

    get beforeDateCalendar () { 
        var lSelectedDate = this.block.$('div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > input:nth-child(1)').getValue()
        if (lSelectedDate != '') 
            Calendar.selectedDate = lSelectedDate
        return Calendar
    }
    get afterDateCalendar () { 
        var lSelectedDate = this.block.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > input:nth-child(1)').getValue()
        if (lSelectedDate != '') 
            Calendar.selectedDate = lSelectedDate
        return Calendar  
    }
    
}

module.exports = new DocumentDateFilter()