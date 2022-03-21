const COHORT360_PARAMS = require('../params/cohort360-param.js')

class PatientContextBar {
    get contextBar () { return $('#context-bar') }
                            
    get nominativeAccessValue () { return COHORT360_PARAMS.NOMINATIF_ACCESS }
    get pseudonymizedAccessValue () { return COHORT360_PARAMS.PSEUDONYMIZED_ACCESS }
    get defaultAccessValue () { return COHORT360_PARAMS.DEFAULT_ACCESS }

    get nbPatientsLibValue () { return 'Nb de patients :' }
    get accessLibValue () { return 'Accès :' }

    get title () { return $('#cohort-name') }
    get nbPatients () { return $('#cohort-patient-number') }
    get access () { return $('#cohort-access-type') }

    async nbPatientsLib () {
        return (await this.nbPatients.getText()).substring(0, (await this.nbPatients.getText()).indexOf(':') + 1).trim()
    }

    async nbPatientsValue () {
        return (await this.nbPatients.getText()).substring((await this.nbPatients.getText()).indexOf(':') + 1).trim()
    }

    async accessLib () {
        return (await this.access.getText()).substring(0, (await this.access.getText()).indexOf(':') + 1).trim() 
    }

    async accessValue () {
        return (await this.access.getText()).substring((await this.access.getText()).indexOf(':') + 1).trim()
    }
}

module.exports = new PatientContextBar()