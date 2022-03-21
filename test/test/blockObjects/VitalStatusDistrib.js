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
            return $('#vital-repartition-card')

        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH)
            return $('div.MuiGrid-grid-xs-12:nth-child(2) > div:nth-child(1)')
    
        return null
    }

    // Bloc "Répartition par statut vital" (values)
    // --------------------------------------------
    get titleValue () { return 'Répartition par statut vital' }

    // Bloc "Répartition par statut vital" (selectors)
    // -----------------------------------------------
    get title () { return $('#vital-repartition-card-title') }
    get graph () { return $('#vital-repartition-card-svg') }

}

module.exports = new VitalStatusDistrib()