const COHORT360_PARAMS = require('../params/cohort360-param.js')

class DocumentSearchFilter {

    block = ''

    get block () {
        return this.block
    }

    set block (pBox) {
        this.block = pBlock
    }

    get inputPlaceholderValue () { return 'Rechercher dans les documents' }
    get searchValueList () { return COHORT360_PARAMS.DOCUMENT_SEARCH_FILTER_LIST }

    get searchButton () { return this.block.$('button:nth-child(2)') }
    get clearButton () { return this.block.$('button:nth-child(1)') }
    get input () { return this.block.$('input.MuiInputBase-input') }

}

module.exports = new DocumentSearchFilter()