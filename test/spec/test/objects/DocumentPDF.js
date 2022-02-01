const PatientContextBar = require("./PatientContextBar")

class DocumentPDF {

    access = ''

    get access () {
        return this.access
    }

    set access (pAccess) {
        this.access = pAccess
    }

    get box () { return $('.MuiDialog-paper') }

    get closeButton () { return this.box.$('button.MuiButton-root:nth-child(1)') }

    get content () {
        if (this.access == PatientContextBar.nominativeAccessValue) 
            return this.box.$('.react-pdf__Document')
        if (this.access == PatientContextBar.pseudonymizedAccessValue)
            return this.box.$('.MuiDialogContent-root > p:nth-child(2)')
    }

}

module.exports = new DocumentPDF()