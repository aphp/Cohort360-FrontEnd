const COHORT360_PARAMS = require('../params/cohort360-param.js')
const List = require('../objects/List.js')

class SavedCohortList extends List {

    get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-justify-xs-flex-end') }

}

module.exports = new SavedCohortList()