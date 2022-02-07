const COHORT360_PARAMS = require('../params/cohort360-param.js')

class AgeFilter {

    box = ''

    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get ageMin () { return COHORT360_PARAMS.PATIENT_AGE_FILTER_AGE_MIN }
    get ageMax () { return COHORT360_PARAMS.PATIENT_AGE_FILTER_AGE_MAX }
    get ageValueList () { return COHORT360_PARAMS.PATIENT_AGE_FILTER_LIST }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(2)') }

    // Bloc "Âge" (values)
    // -------------------
    get titleValue () { return 'Âge :' }

    // Bloc "Âge" (selectors)
    // ----------------------
    get sliderLine () { return this.box.$('.MuiSlider-root') }
    get title () { return this.block.$('h3:nth-child(1)') }
    get interval () { return this.block.$('.MuiSlider-root > input:nth-child(3)') }
    get intervalMin () { return this.block.$('span.MuiSlider-thumb:nth-child(4)') }
    get intervalMax () { return this.block.$('span.MuiSlider-thumb:nth-child(5)') }

    moveAgeMinTo (pAgeMin) {
        return Math.round((pAgeMin - this.ageMin) * this.sliderLine.getSize('width') / (this.ageMax - this.ageMin))
    }

    moveAgeMaxTo (pAgeMax) {
        return Math.round((pAgeMax - this.ageMax) * this.sliderLine.getSize('width') / (this.ageMax - this.ageMin))
    }

    resetAgeMin () {
        return this.moveAgeMinTo(2 * this.ageMin - parseInt(this.intervalMin.getAttribute('aria-valuenow')))
    }

    resetAgeMax () {
        return this.moveAgeMaxTo(2 * this.ageMax - parseInt(this.intervalMax.getAttribute('aria-valuenow')))
    }

    resetAgeInterval () {
        this.intervalMin.dragAndDrop({ x: this.resetAgeMin(), y: 0 })
        this.intervalMax.dragAndDrop({ x: this.resetAgeMax(), y: 0 })
    }

    setAgeMin (pAgeMin) {
        this.intervalMin.dragAndDrop({ x: this.resetAgeMin(), y: 0 })
        this.intervalMin.dragAndDrop({ x: this.moveAgeMinTo(pAgeMin), y: 0 })
    }

    setAgeMax (pAgeMax) {
        this.intervalMax.dragAndDrop({ x: this.resetAgeMax(), y: 0 })
        this.intervalMax.dragAndDrop({ x: this.moveAgeMaxTo(pAgeMax), y: 0 })
    }
}

module.exports = new AgeFilter()