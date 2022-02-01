const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const DocumentPDF = require('../../objects/DocumentPDF')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const MyPatientDocumentsPage = require('../../pageObjects/MyPatientDocumentsPage')

/*const args = process.argv.slice(1)
const path = args[1])*/


const Page = MyPatientDocumentsPage
const DocumentList = Page.documentListBlock

describe('Cohort360 - SCF03 - Filtre tri "Liste documents cliniques"', () => {

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
        Logger.log('Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable')
		expect(DocumentList.sortFilterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable').toBe(true)
        
        Logger.log('Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
        DocumentList.sortFilterButton.click()
        expect(DocumentList.sortFilter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"').toBe(true)
        
        Logger.log('Le titre de la fenêtre modale doit être : ' + DocumentList.sortFilter.titleValue)
        expect(DocumentList.sortFilter.title.getText()).withContext('@ Le titre de la fenêtre modale doit être : ' + DocumentList.sortFilter.titleValue).toBe(DocumentList.sortFilter.titleValue)

        const blocks = DocumentList.sortFilter.sortByFilterBlock.titleValue + ' | ' + DocumentList.sortFilter.orderFilterBlock.titleValue
        Logger.log('Affichage de 2 blocs de filtre : ' + blocks)
        expect(DocumentList.sortFilter.sortByFilterBlock.title.getText()).withContext('@ Affichage de 2 blocs de filtre : ' + blocks).toBe(DocumentList.sortFilter.sortByFilterBlock.titleValue)
        expect(DocumentList.sortFilter.orderFilterBlock.title.getText()).withContext('@ Affichage de 2 blocs de filtre : ' + blocks).toBe(DocumentList.sortFilter.orderFilterBlock.titleValue)
        
        Logger.log('"' + DocumentList.sortFilter.sortByFilterBlock.dateLabelValue + '" est sélectionné par défaut pour le filtre "' + DocumentList.sortFilter.sortByFilterBlock.titleValue + '"')
        expect(DocumentList.sortFilter.sortByFilterBlock.input.getValue()).withContext('@ "' + DocumentList.sortFilter.sortByFilterBlock.dateLabelValue + '" est sélectionné par défaut pour le filtre "' + DocumentList.sortFilter.sortByFilterBlock.titleValue + '"').toBe(DocumentList.sortFilter.sortByFilterBlock.dateLabelValue)

        const orderLabelsValue = DocumentList.sortFilter.orderFilterBlock.increasingLabelValue + ' | ' + DocumentList.sortFilter.orderFilterBlock.descendingLabelValue
        Logger.log('Les choix possible pour le filtre "' + DocumentList.sortFilter.orderFilterBlock.titleValue + '" : ' + orderLabelsValue)
        expect(DocumentList.sortFilter.orderFilterBlock.increasingLabel.getText()).withContext('@ Les choix possible pour le filtre "' + DocumentList.sortFilter.orderFilterBlock.titleValue + '" : ' + orderLabelsValue).toBe(DocumentList.sortFilter.orderFilterBlock.increasingLabelValue)
        expect(DocumentList.sortFilter.orderFilterBlock.descendingLabel.getText()).withContext('@ Les choix possible pour le filtre "' + DocumentList.sortFilter.orderFilterBlock.titleValue + '" : ' + orderLabelsValue).toBe(DocumentList.sortFilter.orderFilterBlock.descendingLabelValue)
        
        Logger.log('"' + DocumentList.sortFilter.orderFilterBlock.descendingLabelValue + '" est sélectionné par défaut')
        expect(DocumentList.sortFilter.orderFilterBlock.isSelected(DocumentList.sortFilter.orderFilterBlock.descendingItem)).withContext('@ "' + DocumentList.sortFilter.orderFilterBlock.descendingLabelValue + '" est sélectionné par défaut').toBe(true)

    })

    // Annuler le filtre
    // -----------------
    it('Annuler le filtre', () => {
        Logger.log('Le bouton "' + DocumentList.sortFilter.cancelButtonValue + '" est clickable')
        expect(DocumentList.sortFilter.cancelButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilter.cancelButtonValue + '" est clickable').toBe(true)

        Logger.log('Annuler le filtre => Fermeture de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
        DocumentList.sortFilter.cancelButton.click()
        Logger.log('Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable')
		expect(DocumentList.sortFilterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable').toBe(true)
    })

    // Trier par
    // ---------
    COHORT360_PARAMS.DOCUMENT_SORT_FILTER_LIST.forEach((sortValue) => {
        it('Trier par : ' + sortValue, () => {
            Logger.log('Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
            DocumentList.sortFilterButton.click()
            expect(DocumentList.sortFilter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"').toBe(true)

            Logger.log('Effacer le choix de tri courant')
            DocumentList.sortFilter.sortByFilterBlock.selectButton.click()
            DocumentList.sortFilter.sortByFilterBlock.clearButton.click()
            expect(DocumentList.sortFilter.sortByFilterBlock.input.getValue()).withContext('@ Effacer le choix de tri courant').toBe("")

            Logger.log('Choix du tri par "' + sortValue + '"')
            DocumentList.sortFilter.sortByFilterBlock.getSelectedItem(sortValue).click()
       
            Logger.log('Le bouton "' + DocumentList.sortFilter.validateButtonValue + '" est clickable')
            expect(DocumentList.sortFilter.validateButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
            DocumentList.sortFilter.validateButton.click()
            Logger.log('Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable')
            expect(DocumentList.sortFilterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable').toBe(true)

            Logger.log('La 1ère ligne de la liste de documents est affichée')
            DocumentList.resetList()
            DocumentList.setCurrentLine(0)
            expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
            Logger.log(DocumentList.currentLineDisplayed)

            Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
		    expect(DocumentList.nbSelectedDocuments.waitForDisplayed()).withContext('@ Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText()).toBe(true)
        })
    })

    // Trier par ordre
    // -----------------
    it('Trier par ordre', () => {
        Logger.log('Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
        DocumentList.sortFilterButton.click()
        expect(DocumentList.sortFilter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"').toBe(true)

        Logger.log('Choix de l\'item "' + DocumentList.sortFilter.orderFilterBlock.increasingLabelValue + '"')
        DocumentList.sortFilter.orderFilterBlock.increasingItem.click()

        Logger.log('Le bouton "' + DocumentList.sortFilter.validateButtonValue + '" est clickable')
        expect(DocumentList.sortFilter.validateButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilter.validateButtonValue + '" est clickable').toBe(true)

        Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + DocumentList.sortFilter.titleValue + '"')
        DocumentList.sortFilter.validateButton.click()
        Logger.log('Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable')
        expect(DocumentList.sortFilterButton.waitForClickable()).withContext('@ Le bouton "' + DocumentList.sortFilterButtonValue + '" est clickable').toBe(true)

        Logger.log('Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText())
		expect(DocumentList.nbSelectedDocuments.waitForDisplayed()).withContext('@ Nombre de documents sélectionnés : ' + DocumentList.nbSelectedDocuments.getText()).toBe(true)

        Logger.log('La 1ère ligne de la liste de documents est affichée')
        DocumentList.resetList()
        DocumentList.setCurrentLine(0)
        expect(DocumentList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
        Logger.log(DocumentList.currentLineDisplayed)
    })

    // Accès à un document
	// -------------------
	it('Accès à un document', () => {
        DocumentPDF.access = Page.access
        
        Logger.log('Ligne n° ' + (DocumentList.lineNumber + 1) + ' - Accès au document')
        DocumentList.currentLinePDFButton.click()

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
