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
            return $('div.MuiGrid-root:nth-child(4) > div:nth-child(1) > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded')    

        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH)
            return $('div.MuiGrid-item:nth-child(3) > div:nth-child(1)')   

        return null  
    }

    // Bloc "Pyramide des âges" (values)
    // ---------------------------------
    get titleValue () { return 'Pyramide des âges' }

    // Bloc "Pyramide des âges" (selectors)
    // ------------------------------------
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get graph () { return this.block.$('svg:nth-child(1)') }

}

module.exports = new AgeStructure()