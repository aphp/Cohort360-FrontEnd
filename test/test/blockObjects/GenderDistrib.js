const COHORT360_PARAMS = require('../params/cohort360-param.js')

class GenderDistrib {

    path = ''

    get path () {
        return this.path
    }

    set path (pPath) {
        this.path = pPath
    }

    get block () { 
        if (this.path == COHORT360_PARAMS.MY_PATIENTS_PAGE_PATH)
            // return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(3) > div:nth-child(1)') 
            return $('div.MuiGrid-item:nth-child(3) > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded')  

        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH)
            return $('div.MuiGrid-justify-content-xs-center:nth-child(1) > div:nth-child(1)')

        return null    
    }

    // Bloc "Répartition par genre" (values)
    // -------------------------------------
    get titleValue () { return 'Répartition par genre' }

    // Bloc "Répartition par genre" (selectors)
    // ----------------------------------------
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get graph () { return this.block.$('svg:nth-child(2)') }

}

module.exports = new GenderDistrib()