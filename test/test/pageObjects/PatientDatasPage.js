const Page = require('./Page')
const GenderDistribBlock = require('../blockObjects/GenderDistrib')
const VitalStatusDistribBlock = require('../blockObjects/VitalStatusDistrib')
const AgeStructureBlock = require('../blockObjects/AgeStructure')
const PatientListBlock = require('../blockObjects/PatientList')
const PatientContextBar = require('../objects/PatientContextBar')

module.exports = class PatientDatasPage extends Page {

    get patientsTab () { return  $('a.MuiButtonBase-root:nth-child(2)') }

    /*get titleValue () { return 'Données patient' }
    get title () { return $('h2.MuiTypography-root') }*/

    /*get access () { 
        PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }*/

    get access () { 
        PatientContextBar.access.waitUntil(() => PatientContextBar.accessValue != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }

    // Bloc "Répartition par genre"
    get genderDistribBlock () {
        GenderDistribBlock.path = this.path 
        return GenderDistribBlock 
    }

    // Bloc "Répartition par statut vital"
    get vitalStatusDistribBlock () { 
        VitalStatusDistribBlock.path = this.path 
        return VitalStatusDistribBlock 
    }

    // Bloc "Pyramide des âges"
    get ageStructureBlock () { 
        AgeStructureBlock.path = this.path
        return AgeStructureBlock 
    }

    // Bloc liste de patients
    get patientListBlock () { return PatientListBlock }

    open (pPath) {
        return super.open(pPath)
    }

    getUrl (pPath) {
        return super.getUrl(pPath)
    }

    login (username, password) {
        super.login (username, password)
    }

}
