const COHORT360_PARAMS = require('../params/cohort360-param.js')

class DocumentTypeFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(1)') }

    get titleValue () { return 'Type de documents :' }
    get labelValueListToSelect () { return COHORT360_PARAMS.DOCUMENT_TYPE_FILTER_TYPE_LIST }

    get title () { return this.block.$('h3:nth-child(1)') }

    get clearButton () { return this.block.$('div > div > div > div > button:nth-child(1)') }
    get selectButton () { return this.block.$('div > div > div > div > button:nth-child(2)') }
    get selectBox () { return browser.$('div.MuiAutocomplete-popper') }
    get selectBoxList () { return this.selectBox.$('div > ul') }

    getIndexOf (pItemLib) {
        for (var i=0; i<this.selectBoxList.$$('li').length; i++)
            if (this.selectBoxList.$$('li')[i].getText() == pItemLib)
                return i
        return -1
    }

    getSelectedItem (pItemLib) {
        return this.selectBoxList.$$('li')[this.getIndexOf(pItemLib)]
    }
    
}

module.exports = new DocumentTypeFilter()