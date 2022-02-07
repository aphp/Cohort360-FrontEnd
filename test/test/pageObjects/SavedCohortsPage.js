const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')

class SavedCohortsPage extends Page {

    get path () { return COHORT360_PARAMS.SAVED_COHORTS_PAGE_PATH }

    get titleValue () { return 'Cohortes sauvegardées' }
    get title () { return $('#cohortSaved-title') }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

}

module.exports = new SavedCohortsPage()