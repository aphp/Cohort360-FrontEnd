const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const DocumentPDF = require('../../objects/DocumentPDF')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const MyPatientDocumentsPage = require('../../pageObjects/MyPatientDocumentsPage')

const Page = MyPatientDocumentsPage
const DocumentList = Page.documentListBlock

describe('Cohort360 - SCF05 - Filtre de recherche "Liste documents cliniques"', () => {

    // Accès à la page "Données patients"
	// ----------------------------------
	it('Accès à la page "Données patients" (authentification)', () => {
        Logger.log('Accès à la page "Données patients"')
        MyPatientDatasPage.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(MyPatientDatasPage.access).withContext('@' + PatientContextBar.accessLibValue + ' ' + MyPatientDatasPage.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Patients" est actif')
		expect(MyPatientDatasPage.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Patients" est actif').toBe('true')

		Logger.log('La 1ère ligne de la liste de patients est affichée')
		MyPatientDatasPage.patientListBlock.resetList()
		MyPatientDatasPage.patientListBlock.setCurrentLine(0)
		expect(MyPatientDatasPage.patientListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
		Logger.log(MyPatientDatasPage.patientListBlock.currentLineDisplayed)
	})

    // Accès à la page "Documents cliniques"
	// -------------------------------------
	it('Accès à la page "Documents cliniques" (authentification)', () => {
        Logger.log('Accès à la page "Documents cliniques"')
        Page.documentsTab.click()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Documents cliniques" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Documents" est actif')
        expect(Page.documentsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Documents" est actif').toBe('true')
        
        Logger.log('La 1ère ligne de la liste de documents est affichée')
        DocumentList.resetList()
        DocumentList.setCurrentLine(0)
        expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
        Logger.log(DocumentList.currentLineDisplayed)
    })

    // Filtre "Rechercher dans les documents"
    // -----------------------------------------------
    it('Filtre "Rechercher dans les documents"', () => {
        Logger.log('Le bouton "Rechercher" est clickable')
        expect(DocumentList.searchFilter.searchButton.isClickable()).withContext('@ Le bouton "Rechercher" est clickable').toBe(true)

        Logger.log('L\'input text a comme valeur "' + DocumentList.searchFilter.inputPlaceholderValue + '"')
        expect(DocumentList.searchFilter.input.getProperty('placeholder')).withContext('@ L\'input text a comme valeur "' + DocumentList.searchFilter.inputPlaceholderValue + '"').toBe(DocumentList.searchFilter.inputPlaceholderValue)

        Logger.log('Saisie de : "' + DocumentList.searchFilter.searchValueList[0] + '" => Le bouton "clear" est clickable')
        DocumentList.searchFilter.input.setValue(DocumentList.searchFilter.searchValueList[0])
        expect(DocumentList.searchFilter.clearButton.isClickable()).withContext('@ Saisie de : "' + DocumentList.searchFilter.searchValueList[0] + '" => Le bouton "clear" est clickable').toBe(true)

        Logger.log('Effacer la saisie => click sur le bouton "clear"')
        DocumentList.searchFilter.clearButton.click()
        expect(DocumentList.searchFilter.input.getValue()).withContext('@ Effacer la saisie => click sur le bouton "clear"').toBe('')

        Logger.log('La 1ère ligne de la liste de documents est affichée')
        DocumentList.resetList()
        DocumentList.setCurrentLine(0)
        expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
        Logger.log(DocumentList.currentLineDisplayed)
    })

    // Lancer une/des recherche(s)
    // ---------------------------
    COHORT360_PARAMS.DOCUMENT_SEARCH_FILTER_LIST.forEach((searchValue) => {
        it('Recherche sur "' + searchValue + '"', () => {
            if (DocumentList.searchFilter.clearButton.waitForClickable()) {
                Logger.log('Effacer la saisie => click sur le bouton "clear"')
                DocumentList.searchFilter.clearButton.click()
                expect(DocumentList.searchFilter.input.getValue()).withContext('@ Effacer la saisie => click sur le bouton "clear"').toBe('')
        
                Logger.log('La 1ère ligne de la liste de documents est affichée')
                DocumentList.resetList()
                DocumentList.setCurrentLine(0)
                expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
                Logger.log(DocumentList.currentLineDisplayed)
            }    
            
            Logger.log('Recherche sur "' + searchValue + '"')
            DocumentList.searchFilter.input.setValue(searchValue)
            DocumentList.searchFilter.searchButton.click()
            expect(DocumentList.searchFilter.input.getValue()).withContext('@ Recherche sur "' + searchValue + '"').toBe(searchValue)

            // browser.pause(10000)

            DocumentList.resetList()
            var linesToCheck = DocumentList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée')
                DocumentList.setCurrentLine(lLineNumber * 2)
                DocumentList.currentLine.scrollIntoView()
                DocumentList.currentLine.click()
                expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée').toBe(true)
                // DocumentList.currentLine.scrollIntoView()
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + DocumentList.currentLineDisplayed)

                DocumentList.setCurrentLine((lLineNumber * 2) + 1) 
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - L\'extrait du document est affiché')
                expect(DocumentList.currentLineDocumentExcerpt.waitForDisplayed()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - L\'extrait du document est affiché').toBe(true)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Extrait : ' + DocumentList.currentLineDocumentExcerpt.getText())
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - L\'extrait du document contient : "' + searchValue + '"')
                expect(DocumentList.checkCurrentLineDocumentExcerpt(searchValue)).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - L\'extrait du document contient : "' + searchValue + '"').toBe(true)

                expect(DocumentList.currentLineDocumentExcerptHighlightedTerm.length).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - Termes "highlightés"').toBeGreaterThan(0)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Termes "highlightés" : ' + DocumentList.getCurrentLineDocumentExcerptHighlightedTerm().slice(0,DocumentList.getCurrentLineDocumentExcerptHighlightedTerm().length))

                /*Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')
                DocumentList.currentLinePDFButton.click()
                expect(DocumentPDF.box.waitForDisplayed()).toBe(true, '@ Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')

                Logger.log('Affichage du document')
                expect(DocumentPDF.content.waitForExist()).toBe(true, '@ Affichage du document')

                Logger.log('Fermeture du document') 
                DocumentPDF.closeButton.click()*/
            }
        })
    })

    // Accès à un document
	// -------------------
	it('Accès à un document', () => {
        DocumentPDF.access = Page.access
        
        DocumentList.setCurrentLine(DocumentList.lineNumber - 1)
        Logger.log('Ligne n° ' + ((DocumentList.lineNumber / 2) + 1) + ' - Accès au document')
        DocumentList.currentLinePDFButton.click()
        expect(DocumentPDF.box.waitForDisplayed()).withContext('@ Ligne n° ' + (DocumentList.lineNumber + 1) + ' - Accès au document').toBe(true)

        Logger.log('Affichage du document')
        expect(DocumentPDF.content.waitForExist()).withContext('@ Affichage du document').toBe(true)

        Logger.log('Fermeture du document') 
        DocumentPDF.closeButton.click()       
    })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})

})