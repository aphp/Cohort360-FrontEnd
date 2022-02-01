const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')
const LeftMenu = require('../objects/LeftMenu')
const PatientListBlock = require('../blockObjects/PatientList')

class SearchPatientPage extends Page {

    get path () { return COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH }

    get titleValue () { return 'Rechercher un patient' }

    get title () { return $('h1.MuiTypography-root') }

    // Bloc liste de patients
    get patientListBlock () { return PatientListBlock }

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
        LeftMenu.myPatientsSearchLink.click()
        browser.waitUntil(() => browser.getUrl() === this.getUrl())
    }

}

module.exports = new SearchPatientPage()