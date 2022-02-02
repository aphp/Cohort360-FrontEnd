const COHORT360_PARAMS = require('../params/cohort360-param.js')
const List = require('../objects/List.js')

class PerimeterList extends List {

    get block () { return $('div.MuiPaper-root:nth-child(2)') }

}

module.exports = new PerimeterList()    