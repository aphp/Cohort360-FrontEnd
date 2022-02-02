const COHORT360_PARAMS = require('../params/cohort360-param.js')

class Patient {

    // Bloc "Patients pris en charge" (values)
    // ---------------------------------------
    get nbPatientsTitleValue () { return 'patients pris en charge' }
    get exploreAllPatientsButtonValue () { return 'Explorer tous les patients' }
    get exploreAllPatientsButtonHrefValue () { return '/' + COHORT360_PARAMS.MY_PATIENTS_PAGE_PATH }
    get explorePerimeterButtonValue () { return 'Explorer un périmètre' }
    get explorePerimeterButtonHrefValue () { return '/' + COHORT360_PARAMS.EXPLORE_PERIMETER_PAGE_PATH }

    // Bloc "Patients pris en charge" (selectors)
    // ------------------------------------------
    get block () { return $('#patients-card') }
    get nbPatientsTitle () { return $('#patients-card-title') }
    // get nbPatientsTitle () { return $('div.MuiGrid-grid-md-6:nth-child(1) > div:nth-child(1) > div:nth-child(1)').$('h2:nth-child(1)*=' + this.patientBlockNbPatientsTitleValue) }
    get exploreAllPatientsButton () { return $('a.MuiButtonBase-root:nth-child(1)') }
    get explorePerimeterButton () { return $('a.MuiButtonBase-root:nth-child(2)') }

}

module.exports = new Patient()