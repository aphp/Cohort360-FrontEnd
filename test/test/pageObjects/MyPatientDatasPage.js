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

    async login (username, password) {
        await super.login (username, password)
        await LeftMenu.open()
        await LeftMenu.openMyPatientsMenu()
        await LeftMenu.myPatientsAllLink.click()
        await browser.getUrl() === MyPatientsPage.getUrl()
        await MyPatientsPage.access()
        await this.patientsTab.click()
        await browser.getUrl() === this.getUrl()
    }

}

module.exports = new MyPatientDatasPage()