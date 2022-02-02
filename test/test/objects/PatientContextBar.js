const COHORT360_PARAMS = require('../params/cohort360-param.js')

class PatientContextBar {
    get contextBar () { return $('#context-bar') }
                            
    get nominativeAccessValue () { return COHORT360_PARAMS.NOMINATIF_ACCESS }
    get pseudonymizedAccessValue () { return COHORT360_PARAMS.PSEUDONYMIZED_ACCESS }
    get defaultAccessValue () { return COHORT360_PARAMS.DEFAULT_ACCESS }

    get nbPatientsLibValue () { return 'Nb de patients :' }
    get accessLibValue () { return 'Accès :' }

    get title () { return this.contextBar.$('#cohort-name') }
    get nbPatients () { return this.contextBar.$('#cohort-patient-number') }
    get nbPatientsLib () { return this.nbPatients.getText().substring(0, this.nbPatients.getText().indexOf(':') + 1).trim() }
    get nbPatientsValue () { return this.nbPatients.getText().substring(this.nbPatients.getText().indexOf(':') + 1).trim() }
    get access () { return this.contextBar.$('#cohort-access-type') }
    get accessLib () { return this.access.getText().substring(0, this.access.getText().indexOf(':') + 1).trim() }
    get accessValue () { return this.access.getText().substring(this.access.getText().indexOf(':') + 1).trim() }
}

module.exports = new PatientContextBar()