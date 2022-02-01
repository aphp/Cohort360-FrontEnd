const COHORT360_PARAMS = require('../params/cohort360-param.js')
const LeftMenu = require('../objects/LeftMenu')
const PatientsPage = require('./PatientsPage')

class MyPatientsPage extends PatientsPage {

    get path () { return COHORT360_PARAMS.MY_PATIENTS_PAGE_PATH }

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
        await browser.getUrl() === this.getUrl()
        await super.getAccesses()
    }
}

module.exports = new MyPatientsPage()