const COHORT360_PARAMS = require('../params/cohort360-param.js')

class AgeStructure {

    path = ''

    get path () {
        return this.path
    }

    set path (pPath) {
        this.path = pPath
    }

    get block () { 
        if (this.path == COHORT360_PARAMS.MY_PATIENTS_PAGE_PATH)
            // return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(4) > div:nth-child(1)')
            return $('#age-structure-card')    

        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH)
            return $('div.MuiGrid-item:nth-child(3) > div:nth-child(1)')   

        return null  
    }

    // Bloc "Pyramide des âges" (values)
    // ---------------------------------
    get titleValue () { return 'Pyramide des âges' }

    // Bloc "Pyramide des âges" (selectors)
    // ------------------------------------
    get title () { return $('#age-structure-card-title') }
    get graph () { return $('#age-structure-card-svg') }

}

module.exports = new AgeStructure()