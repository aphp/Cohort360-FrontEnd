const DocumentPDF = require('../../objects/DocumentPDF')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const MyPatientDocumentsPage = require('../../pageObjects/MyPatientDocumentsPage')
const PatientDetailPage = require('../../pageObjects/PatientDetailPage')

const Page = MyPatientDocumentsPage

describe('Cohort360 - SCP04 - Page "Documents cliniques"', () => {

	// Accès à la page "Données patients"
	// ----------------------------------
	it('Accès à la page "Données patients" (authentification)', () => {
        Logger.log('Accès à la page "Données patients"')
        MyPatientDatasPage.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(MyPatientDatasPage.access).withContext('@ Accès : ' + MyPatientDatasPage.access).not.toBe(PatientContextBar.defaultAccessValue)

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
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' +  + Page.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Documents" est actif')
		expect(Page.documentsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Documents" est actif').toBe('true')

		Logger.log('La 1ère ligne de la liste de documents est affichée')
		Page.documentListBlock.resetList()
		Page.documentListBlock.setCurrentLine(0)
		expect(Page.documentListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
		// Logger.log(Page.documentListBlock.currentLineDisplayed)
	})

	// Bloc liste des documents
	// ------------------------
	it('Bloc liste des documents', () => {
		Page.documentListBlock.resetList()
		Page.documentListBlock.setCurrentLine(0)
		Logger.log('La 1ère ligne du tableau est : ' + Page.documentListBlock.currentLineDisplayed)

		Logger.log('La "loupe" d\'accès au détail patient est clickable')
		expect(Page.documentListBlock.currentLinePatientIdButton.waitForClickable()).withContext('@ La "loupe" d\'accès au détail patient est clickable').toBe(true)

		Logger.log('Le bouton d\'accès au document PDF est clickable')
		expect(Page.documentListBlock.currentLinePDFButton.waitForClickable()).withContext('@ Le bouton d\'accès au document PDF est clickable').toBe(true)
	})

	// Accès à la page "Détail patient"
	// --------------------------------
	it('Accès à la page "Détail patient"', () => {
		const patientTechIdOrIPP = Page.documentListBlock.currentLinePatientId.getText()

		Logger.log('Click sur la 1ère ligne : accès à la page "Détail patient"')
		Page.documentListBlock.currentLinePatientIdButton.click()  
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Détail patient" doit être : ' + PatientDetailPage.getUrl()  + '/' + patientTechIdOrIPP).toBe(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)

		Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toBe(true)
		expect(PatientDetailPage.patientTechIdOrIPP.getText()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toContain(patientTechIdOrIPP)
	})

	// Retour sur la page "Documents cliniques"
	// -------------------------------------
	it('Retour sur la page "Documents cliniques"', () => {
		Logger.log('Le bouton "back" est clickable')
		expect(PatientDetailPage.backButton.waitForClickable()).withContext('@ Le bouton "back" est clickable').toBe(true)
		
		Logger.log('Click sur le bouton "back" : accès à la page "Données patient"')	
		PatientDetailPage.backButton.click()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Documents cliniques" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())
		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(MyPatientDatasPage.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)
		Logger.log('La 1ère ligne de la liste de patients est affichée')
		MyPatientDatasPage.patientListBlock.resetList()
		MyPatientDatasPage.patientListBlock.setCurrentLine(0)
		expect(MyPatientDatasPage.patientListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de patients est affichée').toBe(true)
		
		Logger.log('Accès à la page "Documents cliniques"')
		Page.documentsTab.click()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Documents cliniques" doit être : ' + Page.getUrl()).toBe(Page.getUrl())
		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)
		Logger.log('L\'onglet "Documents" est actif')
		expect(Page.documentsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Documents" est actif').toBe('true')
		Logger.log('La 1ère ligne de la liste de documents est affichée')
		Page.documentListBlock.resetList()
		Page.documentListBlock.setCurrentLine(0)
		expect(Page.documentListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
	})

	// Accès à un document
	// -------------------
	it('Accès à un document', () => {
        DocumentPDF.access = Page.access
        
        Logger.log('Ligne n° ' + (Page.documentListBlock.lineNumber + 1) + ' - Accès au document')
        Page.documentListBlock.currentLinePDFButton.click()

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