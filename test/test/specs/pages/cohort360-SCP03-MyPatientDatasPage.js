const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const PatientDetailPage = require('../../pageObjects/PatientDetailPage')

const Page = MyPatientDatasPage

describe('Cohort360 - SCP03 - Page "Données patient"', () => {

    // Accès à la page "Données patients"
	// ----------------------------------
	it('Accès à la page "Données patients" (authentification)', () => {
        Logger.log('Accès à la page "Données patients"')
        Page.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Patients" est actif')
		expect(Page.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Patients" est actif').toBe('true')

		Logger.log('La 1ère ligne de la liste de patients est affichée')
		Page.patientListBlock.resetList()
		Page.patientListBlock.setCurrentLine(0)
		expect(Page.patientListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
		Logger.log(Page.patientListBlock.currentLineDisplayed)
	})
	
	// Bloc "Répartition par genre"
	// ----------------------------
	it('Bloc "Répartition par genre"', () => {
		Logger.log('Le bloc "Répartition par genre" est affiché')
		expect(Page.genderDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par genre" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + Page.genderDistribBlock.titleValue + '"')
		expect(Page.genderDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + Page.genderDistribBlock.titleValue + '"').toBe(Page.genderDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(Page.genderDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition par statut vital"
	// -----------------------------------
	it('Bloc "Répartition par statut vital"', () => {
		Logger.log('Le bloc "Répartition par statut vital" est affiché')
		expect(Page.vitalStatusDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par statut vital" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + Page.vitalStatusDistribBlock.titleValue + '"')
		expect(Page.vitalStatusDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + Page.vitalStatusDistribBlock.titleValue + '"').toBe(Page.vitalStatusDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(Page.vitalStatusDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})
	
	// Bloc "Pyramide des âges"
	// ------------------------
	it('Bloc "Pyramide des âges"', () => {
		Logger.log('Le bloc "Pyramide des âges" est affiché')
		expect(Page.ageStructureBlock.block.waitForDisplayed()).withContext('@ Le bloc "Pyramide des âges" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + Page.ageStructureBlock.titleValue + '"')
		expect(Page.ageStructureBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + Page.ageStructureBlock.titleValue + '"').toBe(Page.ageStructureBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(Page.ageStructureBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc filtres
	// ------------
	it('Bloc filtres', () => {	
		Logger.log('Nombre de patients sélectionnés : ' + Page.patientListBlock.nbSelectedPatients.getText())
		expect(Page.patientListBlock.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + Page.patientListBlock.nbSelectedPatients.getText()).toBe(true)

		if (Page.access == PatientContextBar.nominativeAccessValue) {

		}	
		else {
			Logger.log('Message recherche désactivée : ' + Page.patientListBlock.disabledSearchMessage.getText())
			expect(Page.patientListBlock.disabledSearchMessage.waitForDisplayed()).withContext('@ Message recherche désactivée : ' + Page.patientListBlock.disabledSearchMessage.getText()).toBe(true)
		}

		Logger.log('Le bouton "Filtrer" est clickable')
		expect(Page.patientListBlock.filterButton.waitForClickable()).withContext('@ Le bouton "Filtrer" est clickable').toBe(true)

		// if (Page.patientListBlock.nbPatients > Page.patientListBlock.max) {
		Logger.log('Affichage de la pagination')
		expect(Page.patientListBlock.pagination.waitForDisplayed()).withContext('@ Affichage de la pagination').toBe(true)
		// }
	})

	// Bloc liste des patients
	// -----------------------
	it('Bloc liste des patients', () => {
		Logger.log('Les colonnes du tableau doivent être : ' + Page.patientListBlock.headerValue.toUpperCase())
		expect(Page.patientListBlock.headerDisplayed.toUpperCase()).withContext('@ Les colonnes du tableau doivent être : ' + Page.patientListBlock.headerValue.toUpperCase()).toBe(Page.patientListBlock.headerValue.toUpperCase())
		Page.patientListBlock.resetList()
		Page.patientListBlock.setCurrentLine(0)
		Logger.log('La 1ère ligne du tableau est : ' + Page.patientListBlock.currentLineDisplayed)

		Logger.log('Test 1ère ligne : la ligne est clickable')
		expect(Page.patientListBlock.currentLine.waitForClickable()).withContext('@ Test 1ère ligne : la ligne est clickable').toBe(true)
	})

	// Accès à la page "Détail patient"
	// --------------------------------
	it('Accès à la page "Détail patient"', () => {
		const patientTechIdOrIPP = Page.patientListBlock.currentLinePatientTechIdOrIPP.getText()

		Logger.log('Click sur la 1ère ligne : accès à la page "Détail patient"')
		Page.patientListBlock.currentLine.click()
		browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Détail patient" doit contenir : ' + PatientDetailPage.getUrl()).toContain(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)

		Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toBe(true)
		expect(PatientDetailPage.patientTechIdOrIPP.getText()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toContain(patientTechIdOrIPP)
	})

	// Retour sur la page "Données patients"
	// -------------------------------------
	it('Retour sur la page "Données patients"', () => {
		/*Logger.log('Le bouton "back" est clickable')
		expect(PatientDetailPage.backButton.waitForClickable()).withContext().toBe(true, '@ Le bouton "back" est clickable')
		
		Logger.log('Click sur le bouton "back" : accès à la page "Données patients"')
		PatientDetailPage.backButton.click()*/
		browser.closeWindow()
		browser.switchWindow(Page.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue +  ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Patients" est actif')
		expect(Page.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Patients" est actif').toBe('true')
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})

})