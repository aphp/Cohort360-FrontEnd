const COHORT360_PARAMS = require('../params/cohort360-param.js')

class VitalStatusDistrib {

    path = ''

    get path () {
        return this.path
    }

    set path (pPath) {
        this.path = pPath
    }

    get block () { 
        if (this.path == COHORT360_PARAMS.MY_PATIENTS_PAGE_PATH)
            // return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)')
            return $('div.MuiGrid-grid-lg-4:nth-child(1) > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded')

        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH)
            return $('div.MuiGrid-grid-xs-12:nth-child(2) > div:nth-child(1)')
    
        return null
    }

    // Bloc "Répartition par statut vital" (values)
    // --------------------------------------------
    get titleValue () { return 'Répartition par statut vital' }

    // Bloc "Répartition par statut vital" (selectors)
    // -----------------------------------------------
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get graph () { return this.block.$('svg:nth-child(1)') }

}

module.exports = new VitalStatusDistrib()