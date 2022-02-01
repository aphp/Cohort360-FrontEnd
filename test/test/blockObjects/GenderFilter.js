const COHORT360_PARAMS = require('../params/cohort360-param.js')

class GenderFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(1)') }

    get genderValueList () { return COHORT360_PARAMS.PATIENT_GENDER_FILTER_LIST }

    // Bloc "Genre" (values)
    // ---------------------
    get titleValue () { return 'Genre :' }
    get maleLabelValue () { return COHORT360_PARAMS.PATIENT_GENDER_MALE_LIB }
    get femaleLabelValue () { return COHORT360_PARAMS.PATIENT_GENDER_FEMALE_LIB }
    get otherLabelValue () { return COHORT360_PARAMS.PATIENT_GENDER_OTHER_LIB }
    get allLabelValue () { return COHORT360_PARAMS.PATIENT_GENDER_ALL_LIB }

    // Bloc "Genre" (selectors)
    // ------------------------
    get title () { return this.block.$('h3:nth-child(1)') }
    get maleLabel () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(2)') }
    get femaleLabel () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(2)') }
    get otherLabel () { return this.block.$('div:nth-child(2) > label:nth-child(3) > span:nth-child(2)') }
    get allLabel () { return this.block.$('div:nth-child(2) > label:nth-child(4) > span:nth-child(2)') }
    get maleItem () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get femaleItem () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get otherItem () { return this.block.$('div:nth-child(2) > label:nth-child(3) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get allItem () { return this.block.$('div:nth-child(2) > label:nth-child(4) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }

    isSelected (pItem) {
        if (pItem.parentElement().parentElement().getAttribute('class').indexOf('Mui-checked') != -1)
            return true 
        else 
            return false
    }

    getSelectedItem (pItemLib) {
        if (pItemLib == this.femaleLabelValue)
            return this.femaleItem
        if (pItemLib == this.maleLabelValue)
            return this.maleItem
        if (pItemLib == this.otherLabelValue)
            return this.otherItem
        if (pItemLib == this.allLabelValue)
            return this.allItem
        return null
    }

}

module.exports = new GenderFilter()