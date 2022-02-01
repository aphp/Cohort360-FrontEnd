class Calendar {

    selectedDate = (new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()) + '/' + ((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1) + '/' + new Date().getFullYear()
    
    set selectedDate (pSelectedDate) { 
        if (pSelectedDate != '')
            this.selectedDate = pSelectedDate 
    }
    get selectedDate () { return this.selectedDate }

    get box () { return $('.MuiPickersModal-dialogRoot') }

    get yearButton () { return this.box.$('button.MuiPickersToolbarButton-toolbarBtn:nth-child(1)') }
    get monthPreviousButton () { return this.box.$('button.MuiPickersCalendarHeader-iconButton:nth-child(1)') }
    get monthNextButton () { return this.box.$('button.MuiPickersCalendarHeader-iconButton:nth-child(3)') }

    get yearSelectBox () { return this.box.$('.MuiPickersYearSelection-container') }

    get clearButton () { return this.box.$('div.MuiDialogActions-root:nth-child(2) > button:nth-child(1)') }
    get cancelButton () { return this.box.$('div.MuiDialogActions-root:nth-child(2) > button:nth-child(2)') }
    get okButton () { return this.box.$('div.MuiDialogActions-root:nth-child(2) > button:nth-child(3)') }
    
    selectYear (pDateString) {
        var lDate = new Date(this.toEnDateFormat(pDateString))
        var index = lDate.getFullYear() - 1900 + 1
        this.yearButton.click()
        this.box.$('div.MuiTypography-root:nth-child('+ index + ')').click()
    }

    selectMonth (pDateString) {
        var lDate = new Date(this.toEnDateFormat(pDateString))
        var index = lDate.getMonth() - new Date(this.toEnDateFormat(this.selectedDate)).getMonth()

        if (index > 0)
            for (var i=0; i<index; i++)
                this.monthNextButton.click()

        if (index < 0) {
            index = 0 - index
            for (var i=0; i<index; i++)
                this.monthPreviousButton.click()
        }
    }

    selectDate (pDateString) {
        var lDate = new Date(this.toEnDateFormat(pDateString))

        var lFirstWeekDay = new Date(lDate.getFullYear(), lDate.getMonth(), 1).getDay() - 1
        if (lFirstWeekDay < 0) lFirstWeekDay = 6
        var lOffsetDate = lDate.getDate() + lFirstWeekDay - 1
        var lWeekOfMonth = Math.floor(lOffsetDate / 7) + 1
        
        var lWeekDay = (lDate.getDay() == 0 ? 7 : lDate.getDay())

        this.box.$('div.MuiPickersCalendar-week:nth-child(' + lWeekOfMonth + ') > div:nth-child(' + lWeekDay + ') > button:nth-child(1)').click()
    }

    setDate (pDateString) {
        this.selectYear(pDateString)
        this.selectMonth(pDateString)
        this.selectDate(pDateString)
    }

    toEnDateFormat (pDateString) {
        var lDateSplit = pDateString.split('/')
        return lDateSplit[1] + '/' + lDateSplit[0] + '/' + lDateSplit[2]
    }
}

module.exports = new Calendar()