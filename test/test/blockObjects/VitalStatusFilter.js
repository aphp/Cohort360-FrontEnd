const COHORT360_PARAMS = require('../params/cohort360-param.js')

class VitalStatusFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(3)') }

    get vitalStatusValueList () { return COHORT360_PARAMS.PATIENT_VITAL_STATUS_FILTER_LIST }

    // Bloc "Statut vital" (values)
    // ----------------------------
    get titleValue () { return 'Statut vital :' }
    get aliveLabelValue () { return COHORT360_PARAMS.PATIENT_VITAL_STATUS_ALIVE_LIB }
    get deadLabelValue () { return COHORT360_PARAMS.PATIENT_VITAL_STATUS_DEAD_LIB }
    get allLabelValue () { return COHORT360_PARAMS.PATIENT_VITAL_STATUS_ALL_LIB }

    // Bloc "Statut vital" (selectors)
    // -------------------------------
    get title () { return this.block.$('h3:nth-child(1)') }
    get aliveLabel () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(2)') }
    get deadLabel () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(2)') }
    get allLabel () { return this.block.$('div:nth-child(2) > label:nth-child(3) > span:nth-child(2)') }
    get aliveItem () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get deadItem () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get allItem () { return this.block.$('div:nth-child(2) > label:nth-child(3) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }

    isSelected (pItem) {
        if (pItem.parentElement().parentElement().getAttribute('class').indexOf('Mui-checked') != -1)
            return true 
        else 
            return false
    }

    getSelectedItem (pItemLib) {
        if (pItemLib == this.aliveLabelValue)
            return this.aliveItem
        if (pItemLib == this.deadLabelValue)
            return this.deadItem
        if (pItemLib == this.allLabelValue)
            return this.allItem
        return null
    }
}

module.exports = new VitalStatusFilter()