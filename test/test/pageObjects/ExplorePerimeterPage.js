const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')

class ExplorePerimeterPage extends Page {

    get path () { return COHORT360_PARAMS.EXPLORE_PERIMETER_PAGE_PATH }

    get titleValue () { return 'Explorer un perimètre' }
    get title () { return $('h1.MuiTypography-root') }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

}

module.exports = new ExplorePerimeterPage()