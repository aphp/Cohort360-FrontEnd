const COHORT360_PARAMS = require('../params/cohort360-param.js')
const LeftMenu = require('../objects/LeftMenu')
const MyPatientsPage = require('./MyPatientsPage')
const PatientDatasPage = require('./PatientDatasPage')

class MyPatientDatasPage extends PatientDatasPage {

    get path () { return COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH }

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
        MyPatientsPage.access
        this.patientsTab.click()
        browser.waitUntil(() => browser.getUrl() === this.getUrl())
    }

}

module.exports = new MyPatientDatasPage()