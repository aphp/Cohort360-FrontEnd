const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const DocumentPDF = require('../../objects/DocumentPDF')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const MyPatientDocumentsPage = require('../../pageObjects/MyPatientDocumentsPage')

const Page = MyPatientDocumentsPage
const DocumentList = Page.documentListBlock

describe('Cohort360 - SCF04 - Filtre "Liste documents cliniques"', () => {

    // Accès à la page "Données patients"
	// ----------------------------------
	it('Accès à la page "Données patients" (authentification)', () => {
        Logger.log('Accès à la page "Données patients"')
        MyPatientDatasPage.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(MyPatientDatasPage.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + MyPatientDatasPage.access).not.toBe(PatientContextBar.defaultAccessValue)

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

    // Accès au filtre
    // ---------------
    it('Accès au filtre', () => {
        Logger.log('Le bouton "' + DocumentList.filterButtonValue + '" est clickable')
		expect(DocumentList.filterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filterButtonValue + '" est clickable').toBe(true)
        
        Logger.log('Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
        DocumentList.filterButton.click()
        expect(DocumentList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"').toBe(true)

        Logger.log('Le titre de la fenêtre modale doit être : ' + DocumentList.filter.titleValue)
        expect(DocumentList.filter.title.getText()).withContext('@ Le titre de la fenêtre modale doit être : ' + DocumentList.filter.titleValue).toBe(DocumentList.filter.titleValue)

        const blocks = DocumentList.filter.typeFilterBlock.titleValue + ' | ' + DocumentList.filter.dateFilterBlock.titleValue
        Logger.log('Affichage de 2 blocs de filtre : ' + blocks)
        expect(DocumentList.filter.typeFilterBlock.title.getText()).withContext('@ Affichage de 2 blocs de filtre : ' + blocks).toBe(DocumentList.filter.typeFilterBlock.titleValue)
        expect(DocumentList.filter.dateFilterBlock.title.getText()).withContext('@ Affichage de 2 blocs de filtre : ' + blocks).toBe(DocumentList.filter.dateFilterBlock.titleValue)

        const dateInterval = DocumentList.filter.dateFilterBlock.afterDateLabelValue + ' | ' + DocumentList.filter.dateFilterBlock.beforeDateLabelValue
        Logger.log('Le bloc "' + DocumentList.filter.dateFilterBlock.titleValue + '" contient l\'intervalle de date : ' + dateInterval)
        expect(DocumentList.filter.dateFilterBlock.afterDateLabel.getText()).withContext('@ Le bloc "' + DocumentList.filter.dateFilterBlock.titleValue + '" contient l\'intervalle de date : ' + dateInterval).toBe(DocumentList.filter.dateFilterBlock.afterDateLabelValue)
        expect(DocumentList.filter.dateFilterBlock.beforeDateLabel.getText()).withContext('@ Le bloc "' + DocumentList.filter.dateFilterBlock.titleValue + '" contient l\'intervalle de date : ' + dateInterval).toBe(DocumentList.filter.dateFilterBlock.beforeDateLabelValue)
    })

    // Annuler le filtre
    // -----------------
    it('Annuler le filtre', () => {
        Logger.log('Le bouton "' + DocumentList.filter.cancelButtonValue + '" est clickable')
        expect(DocumentList.filter.cancelButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filter.cancelButtonValue + '" est clickable').toBe(true)

        Logger.log('Annuler le filtre => Fermeture de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
        DocumentList.filter.cancelButton.click()
        Logger.log('Le bouton "' + DocumentList.filterButtonValue + '" est clickable')
		expect(DocumentList.filterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filterButtonValue + '" est clickable').toBe(true)
    })

    // Filtrer par "Type de document"
    // ------------------------------
    COHORT360_PARAMS.DOCUMENT_TYPE_FILTER_TYPE_LIST.forEach((typeValue) => {
        it('Filtrer par "Type de document" : ' + typeValue[0], () => {
            //DocumentPDF.access = Page.access
            Logger.log('Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
            DocumentList.filterButton.click()
            expect(DocumentList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"').toBe(true)

            Logger.log('Choix du tri par "' + typeValue[0] + '"')
            DocumentList.filter.typeFilterBlock.selectButton.click()
            DocumentList.filter.typeFilterBlock.getSelectedItem(typeValue[0]).click()
            DocumentList.filter.typeFilterBlock.selectButton.click()
       
            Logger.log('Le bouton "' + DocumentList.filter.validateButtonValue + '" est clickable')
            expect(DocumentList.filter.validateButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
            DocumentList.filter.validateButton.click()
            Logger.log('Le bouton "' + DocumentList.filterButtonValue + '" est clickable')
            expect(DocumentList.filterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filterButtonValue + '" est clickable').toBe(true)

            Logger.log('Le bouton de filtre "' + typeValue[0] + '" est affiché')
            expect(DocumentList.selectedFilters.isFilterSelected(typeValue[0])).withContext('@ Les boutons de filtre "' + DocumentList.selectedFilters.afterDateLib + '" & "' + DocumentList.selectedFilters.beforeDateLib + '" sont affichés').toBe(true)

            DocumentList.resetList()
            var linesToCheck = DocumentList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée')
                DocumentList.setCurrentLine(lLineNumber)
                DocumentList.currentLine.scrollIntoView()
                DocumentList.currentLine.click()
                expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée').toBe(true)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + DocumentList.currentLineDisplayed)

                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Le type du document "' + DocumentList.currentLineDocumentName.getText() + '" doit être parmi le ou les type(s) séléctionné(s)')
                expect(DocumentList.checkCurrentLineDocumentType()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - Le type du document "' + DocumentList.currentLineDocumentName.getText() + '" doit être parmi le ou les type(s) séléctionné(s)').toBe(true)

                /*Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')
                DocumentList.currentLinePDFButton.click()
                expect(DocumentPDF.box.waitForDisplayed()).withContext().toBe(true, '@ Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')

                Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Affichage du document')
                expect(DocumentPDF.content.waitForExist()).withContext().toBe(true, '@ Ligne n° ' + (lLineNumber + 1) + ' - Affichage du document')

                Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Fermeture du document') 
                DocumentPDF.closeButton.click()*/
            }

            Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
		    expect(DocumentList.nbSelectedDocuments.waitForDisplayed()).withContext('@ Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText()).toBe(true)
        })
    })

    // Filtrer par "Date"
    // ------------------
    COHORT360_PARAMS.DOCUMENT_DATE_FILTER_INTERVAL_LIST.forEach((dateValue) => {
        it('Filtrer par "Date" : ' + dateValue[0] + ' - ' + dateValue[1], () => {
            //DocumentPDF.access = Page.access
            Logger.log('Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
            DocumentList.filterButton.click()
            expect(DocumentList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.filter.titleValue + '"').toBe(true)

            var lAfterDate = dateValue[0]
            Logger.log(DocumentList.filter.dateFilterBlock.afterDateLabelValue + ' ' + lAfterDate)
            DocumentList.filter.dateFilterBlock.afterDateCalendarButton.click()
            DocumentList.filter.dateFilterBlock.afterDateCalendar.setDate(lAfterDate)
            DocumentList.filter.dateFilterBlock.afterDateCalendar.okButton.click()
            expect(DocumentList.filter.dateFilterBlock.afterDateInput.getValue()).withContext('@ ' + DocumentList.filter.dateFilterBlock.afterDateLabelValue + ' ' + lAfterDate).toBe(lAfterDate)

            var lBeforeDate = dateValue[1]
            Logger.log(DocumentList.filter.dateFilterBlock.beforeDateLabelValue + ' ' + lBeforeDate)
            DocumentList.filter.dateFilterBlock.beforeDateCalendarButton.click()
            DocumentList.filter.dateFilterBlock.beforeDateCalendar.setDate(lBeforeDate)
            DocumentList.filter.dateFilterBlock.beforeDateCalendar.okButton.click()
            expect(DocumentList.filter.dateFilterBlock.beforeDateInput.getValue()).withContext('@ ' + DocumentList.filter.dateFilterBlock.beforeDateLabelValue + ' ' + lBeforeDate).toBe(lBeforeDate)

            Logger.log('Le bouton "' + DocumentList.filter.validateButtonValue + '" est clickable')
            expect(DocumentList.filter.validateButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + DocumentList.filter.titleValue + '"')
            DocumentList.filter.validateButton.click()
            Logger.log('Le bouton "' + DocumentList.filterButtonValue + '" est clickable')
            expect(DocumentList.filterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.filterButtonValue + '" est clickable').toBe(true)

            Logger.log('Les boutons de filtre "' + DocumentList.selectedFilters.afterDateLib + '" & "' + DocumentList.selectedFilters.beforeDateLib + '" sont affichés')
            expect(DocumentList.selectedFilters.isAfterDateFilterSelected() && DocumentList.selectedFilters.isBeforeDateFilterSelected()).withContext('@ Les boutons de filtre "' + DocumentList.selectedFilters.afterDateLib + '" & "' + DocumentList.selectedFilters.beforeDateLib + '" sont affichés').toBe(true)

            DocumentList.resetList()
            var linesToCheck = DocumentList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée')
                DocumentList.setCurrentLine(lLineNumber)
                DocumentList.currentLine.scrollIntoView()
                DocumentList.currentLine.click()
                expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée').toBe(true)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + DocumentList.currentLineDisplayed)

                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - La date du document ' + DocumentList.currentLineDocumentDate.getText() + ' doit être comprise entre le ' + lAfterDate + ' et le ' + lBeforeDate)
                expect(DocumentList.checkCurrentLineDocumentDate(lAfterDate, lBeforeDate)).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - La date du document ' + DocumentList.currentLineDocumentDate.getText() + ' doit être comprise entre le ' + lAfterDate + ' et le ' + lBeforeDate).toBe(true)

                /*Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')
                DocumentList.currentLinePDFButton.click()
                expect(DocumentPDF.box.waitForDisplayed()).withContext().toBe(true, '@ Ligne n° ' + (lLineNumber + 1) + ' - Accès au document')

                Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Affichage du document')
                expect(DocumentPDF.content.waitForExist()).withContext().toBe(true, '@ Ligne n° ' + (lLineNumber + 1) + ' - Affichage du document')

                Logger.log('Ligne n° ' + (lLineNumber + 1) + ' - Fermeture du document') 
                DocumentPDF.closeButton.click()*/
            }

            Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
            expect(DocumentList.nbSelectedDocuments.waitForDisplayed()).withContext('@ Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText()).toBe(true)
        })
    })

    // Accès à un document
	// -------------------
	it('Accès à un document', () => {
        DocumentPDF.access = Page.access

        Logger.log('Ligne n° ' + (DocumentList.lineNumber + 1) + ' - Accès au document')
        DocumentList.currentLinePDFButton.click()
        expect(DocumentPDF.box.waitForDisplayed()).withContext('@ Ligne n° ' + (DocumentList.lineNumber + 1) + ' - Accès au document').toBe(true)

        Logger.log('Affichage du document')
        expect(DocumentPDF.content.waitForExist()).withContext('@ Affichage du document').toBe(true)

        Logger.log('Fermeture du document') 
        DocumentPDF.closeButton.click()       
    })

    // Fermer les filtres
    // ------------------
    it('Fermer les filtres', () => {
        Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
        DocumentList.setCurrentLine(0)
        Logger.log('1ère ligne de la liste des documents : ' + DocumentList.currentLineDisplayed)

        var lButtonList = DocumentList.selectedFilters.buttonList
        
        for (var i=0; i<lButtonList.length; i++) {
            var lButtonLib = lButtonList[i].getText()

            Logger.log('Fermeture du filtre : ' + lButtonLib)
            expect(DocumentList.selectedFilters.closeFilter(lButtonLib)).withContext('@ Fermeture du filtre : ' + lButtonLib).toBe(true)

            Logger.log('Le bouton du filtre "' + lButtonLib + '" n\'est plus affiché')
            expect(DocumentList.selectedFilters.isFilterSelected(lButtonLib)).withContext('@ Le bouton du filtre "' + lButtonLib + '" n\'est plus affiché').toBe(false)

            DocumentList.resetList()
            DocumentList.setCurrentLine(0)
            expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ 1ère ligne de la liste des documents').toBe(true)
            Logger.log('1ère ligne de la liste des documents : ' + DocumentList.currentLineDisplayed)
            
            Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
            expect(DocumentList.nbSelectedDocuments.waitForDisplayed()).withContext('@ Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText()).toBe(true)
        }
    })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})

})
