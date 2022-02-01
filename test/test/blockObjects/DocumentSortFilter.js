const COHORT360_PARAMS = require('../params/cohort360-param.js')

class DocumentSortFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(1) > div:nth-child(1)') }


    // Bloc "Trier par" (values)
    // ----------------------------
    get titleValue () { return 'Trier par :' }
    get dateLabelValue () { return COHORT360_PARAMS.DOCUMENT_SORT_DATE_LIB }
    get documentTypeLabelValue () { return COHORT360_PARAMS.DOCUMENT_SORT_TYPE_LIB }
    get labelValueListToSelect () { return COHORT360_PARAMS.DOCUMENT_SORT_FILTER_LIST }

    // Bloc "Trier par" (selectors)
    // -------------------------------
    get title () { return this.block.$('div:nth-child(1) > label:nth-child(1)') }
    get input () { return this.block.$('div:nth-child(1) > div > input') }

    get clearButton () { return this.block.$('div:nth-child(1) > div > div > button:nth-child(1)') }
    get selectButton () { return this.block.$('div:nth-child(1) > div > div > button:nth-child(2)') }
    get selectBox () { return browser.$('div.MuiAutocomplete-popper') }
    get selectBoxList () { return this.selectBox.$('div > ul') }
    // get selectBoxDateItem () { return this.selectBoxList.$$('li')[0] }
    // get selectBoxDocumentTypeItem () { return this.selectBoxList.$$('li')[1] }
    get selectBoxDateItem () { return this.selectBoxList.$$('li')[this.getIndexOf(this.dateLabelValue)] }
    get selectBoxDocumentTypeItem () { return this.selectBoxList.$$('li')[this.getIndexOf(this.documentTypeLabelValue)] }

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

module.exports = new DocumentSortFilter()