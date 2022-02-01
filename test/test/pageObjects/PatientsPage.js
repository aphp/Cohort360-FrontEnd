const Page = require('./Page')
const NbPatientsBlock = require('../blockObjects/NbPatients')
const VitalStatusBlock = require('../blockObjects/VitalStatus')
const VitalStatusDistribBlock = require('../blockObjects/VitalStatusDistrib')
const VisitTypeDistribBlock = require('../blockObjects/VisitTypeDistrib')
const GenderDistribBlock = require('../blockObjects/GenderDistrib')
const AgeStructureBlock = require('../blockObjects/AgeStructure')
const VisitsPerMonthDistribBlock = require('../blockObjects/VisitsPerMonthDistrib')
const PatientContextBar = require('../objects/PatientContextBar')

module.exports = class PatientsPage extends Page {

    get previewTab () { return  $('a.MuiButtonBase-root:nth-child(1)') }

    /*get access () { 
        PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }*/

    access = async () => {
        await PatientContextBar.access.waitUntil(() => PatientContextBar.accessValue != PatientContextBar.defaultAccessValue)
        return PatientContextBar.accessValue
    }

    // Bloc "Nombre de Patients"
    get nbPatientsBlock () { return NbPatientsBlock }

    // Bloc "Statut vital"
    get vitalStatusBlock () { return VitalStatusBlock }

    // Bloc "Répartition par statut vital"
    get vitalStatusDistribBlock () { 
        VitalStatusDistribBlock.path = this.path 
        return VitalStatusDistribBlock 
    }

    // Bloc "Répartition par type de visite"
    get visitTypeDistribBlock () { return VisitTypeDistribBlock }

    // Bloc "Répartition par genre"
    get genderDistribBlock () {
        GenderDistribBlock.path = this.path 
        return GenderDistribBlock 
    }

    // Bloc "Pyramide des âges"
    get ageStructureBlock () { 
        AgeStructureBlock.path = this.path
        return AgeStructureBlock 
    }

    // Bloc "Répartition des visites par mois"
    get visitsPerMonthDistribBlock () { return VisitsPerMonthDistribBlock }

    open (pPath) {
        return super.open(pPath)
    }

    getUrl (pPath) {
        return super.getUrl(pPath)
    }

    async login (username, password) {
        await super.login (username, password)
    }

    async getAccesses () {
        let accesses = await this.access
        return accesses
    }
}
