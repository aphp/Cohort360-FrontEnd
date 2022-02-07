const COHORT360_PARAMS = require('../params/cohort360-param.js')
const PatientDocumentsPage = require('./PatientDocumentsPage')
const LeftMenu = require('../objects/LeftMenu')
const MyPatientsPage = require('./MyPatientsPage')


class MyPatientDocumentsPage extends PatientDocumentsPage {

    get path () { return COHORT360_PARAMS.PATIENT_DOCUMENTS_PAGE_PATH }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

    login (username, password) {
        super.login (username, password)
        LeftMenu.open()
        LeftMenu.openMyPatientsMenu()
        LeftMenu.myPatientsAllLink.click()
        browser.waitUntil(() => browser.getUrl() === MyPatientsPage.getUrl())
        MyPatientsPage.access.getText()
        this.documentsTab.click()
        browser.waitUntil(() => browser.getUrl() === this.getUrl())
    }

}

module.exports = new MyPatientDocumentsPage()