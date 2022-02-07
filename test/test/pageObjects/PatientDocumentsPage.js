const Page = require('./Page')
const PatientContextBar = require('../objects/PatientContextBar')
const DocumentListBlock = require('../blockObjects/DocumentList')

module.exports = class PatientDocumentsPage extends Page {

    get documentsTab () { return  $('a.MuiButtonBase-root:nth-child(3)') }

    /*get titleValue () { return 'Documents cliniques' }
    get title () { return $('h2.MuiTypography-root') }*/

    /*get access () { 
        PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }*/

    get access () { 
        PatientContextBar.access.waitUntil(() => PatientContextBar.accessValue != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }

    // Bloc liste de documents
    get documentListBlock () { return DocumentListBlock }

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
