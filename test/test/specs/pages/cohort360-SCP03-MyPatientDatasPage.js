const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const PatientDetailPage = require('../../pageObjects/PatientDetailPage')

const Page = MyPatientDatasPage

describe('Cohort360 - SCP03 - Page "Données patient"', () => {

	// Accès à la page "Données patients"
	// ----------------------------------

	it('Accès à la page "Données patients" (authentification)', async () => {

    	Logger.log('Accès à la page "Données patients"')
    	await MyPatientDatasPage.login()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + await MyPatientDatasPage.access())
		expect(await MyPatientDatasPage.access()).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + await MyPatientDatasPage.access()).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Patients" est actif')
		expect(await MyPatientDatasPage.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Patients" est actif').toBe('true')

		Logger.log('La 1ère ligne de la liste de patients est affichée')
		MyPatientDatasPage.patientListBlock.resetList()
		// MyPatientDatasPage.patientListBlock.setCurrentLine(0)
		// expect(MyPatientDatasPage.patientListBlock.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)

		// Logger.log(MyPatientDatasPage.patientListBlock.currentLineDisplayed)
	})
	
	// // Bloc "Répartition par genre"
	// // ----------------------------
	// it('Bloc "Répartition par genre"', () => {
	// 	Logger.log('Le bloc "Répartition par genre" est affiché')
	// 	expect(MyPatientDatasPage.genderDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par genre" est affiché').toBe(true)

	// 	Logger.log('Le tire du bloc doit être "' + MyPatientDatasPage.genderDistribBlock.titleValue + '"')
	// 	expect(MyPatientDatasPage.genderDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientDatasPage.genderDistribBlock.titleValue + '"').toBe(MyPatientDatasPage.genderDistribBlock.titleValue)

	// 	Logger.log('Le graphique est affiché')
	// 	expect(MyPatientDatasPage.genderDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	// })

	// // Bloc "Répartition par statut vital"
	// // -----------------------------------
	// it('Bloc "Répartition par statut vital"', () => {
	// 	Logger.log('Le bloc "Répartition par statut vital" est affiché')
	// 	expect(MyPatientDatasPage.vitalStatusDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par statut vital" est affiché').toBe(true)

	// 	Logger.log('Le tire du bloc doit être "' + MyPatientDatasPage.vitalStatusDistribBlock.titleValue + '"')
	// 	expect(MyPatientDatasPage.vitalStatusDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientDatasPage.vitalStatusDistribBlock.titleValue + '"').toBe(MyPatientDatasPage.vitalStatusDistribBlock.titleValue)

	// 	Logger.log('Le graphique est affiché')
	// 	expect(MyPatientDatasPage.vitalStatusDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	// })
	
	// // Bloc "Pyramide des âges"
	// // ------------------------
	// it('Bloc "Pyramide des âges"', () => {
	// 	Logger.log('Le bloc "Pyramide des âges" est affiché')
	// 	expect(MyPatientDatasPage.ageStructureBlock.block.waitForDisplayed()).withContext('@ Le bloc "Pyramide des âges" est affiché').toBe(true)

	// 	Logger.log('Le tire du bloc doit être "' + MyPatientDatasPage.ageStructureBlock.titleValue + '"')
	// 	expect(MyPatientDatasPage.ageStructureBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientDatasPage.ageStructureBlock.titleValue + '"').toBe(MyPatientDatasPage.ageStructureBlock.titleValue)

	// 	Logger.log('Le graphique est affiché')
	// 	expect(MyPatientDatasPage.ageStructureBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	// })

	// // Bloc filtres
	// // ------------
	// it('Bloc filtres', () => {	
	// 	Logger.log('Nombre de patients sélectionnés : ' + MyPatientDatasPage.patientListBlock.nbSelectedPatients.getText())
	// 	expect(MyPatientDatasPage.patientListBlock.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + MyPatientDatasPage.patientListBlock.nbSelectedPatients.getText()).toBe(true)

	// 	if (MyPatientDatasPage.access == PatientContextBar.nominativeAccessValue) {

	// 	}	
	// 	else {
	// 		Logger.log('Message recherche désactivée : ' + MyPatientDatasPage.patientListBlock.disabledSearchMessage.getText())
	// 		expect(MyPatientDatasPage.patientListBlock.disabledSearchMessage.waitForDisplayed()).withContext('@ Message recherche désactivée : ' + MyPatientDatasPage.patientListBlock.disabledSearchMessage.getText()).toBe(true)
	// 	}

	// 	Logger.log('Le bouton "Filtrer" est clickable')
	// 	expect(MyPatientDatasPage.patientListBlock.filterButton.waitForClickable()).withContext('@ Le bouton "Filtrer" est clickable').toBe(true)

	// 	// if (MyPatientDatasPage.patientListBlock.nbPatients > MyPatientDatasPage.patientListBlock.max) {
	// 	Logger.log('Affichage de la pagination')
	// 	expect(MyPatientDatasPage.patientListBlock.pagination.waitForDisplayed()).withContext('@ Affichage de la pagination').toBe(true)
	// 	// }
	// })

	// // Bloc liste des patients
	// // -----------------------
	// it('Bloc liste des patients', () => {
	// 	Logger.log('Les colonnes du tableau doivent être : ' + MyPatientDatasPage.patientListBlock.headerValue.toUpperCase())
	// 	expect(MyPatientDatasPage.patientListBlock.headerDisplayed.toUpperCase()).withContext('@ Les colonnes du tableau doivent être : ' + MyPatientDatasPage.patientListBlock.headerValue.toUpperCase()).toBe(MyPatientDatasPage.patientListBlock.headerValue.toUpperCase())
	// 	MyPatientDatasPage.patientListBlock.resetList()
	// 	MyPatientDatasPage.patientListBlock.setCurrentLine(0)
	// 	Logger.log('La 1ère ligne du tableau est : ' + MyPatientDatasPage.patientListBlock.currentLineDisplayed)

	// 	Logger.log('Test 1ère ligne : la ligne est clickable')
	// 	expect(MyPatientDatasPage.patientListBlock.currentLine.waitForClickable()).withContext('@ Test 1ère ligne : la ligne est clickable').toBe(true)
	// })

	// // Accès à la page "Détail patient"
	// // --------------------------------
	// it('Accès à la page "Détail patient"', () => {
	// 	const patientTechIdOrIPP = MyPatientDatasPage.patientListBlock.currentLinePatientTechIdOrIPP.getText()

	// 	Logger.log('Click sur la 1ère ligne : accès à la page "Détail patient"')
	// 	MyPatientDatasPage.patientListBlock.currentLine.click()
	// 	browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
	// 	expect(browser.getUrl()).withContext('@ L\'URL de la page "Détail patient" doit contenir : ' + PatientDetailPage.getUrl()).toContain(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)

	// 	Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
	// 	expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toBe(true)
	// 	expect(PatientDetailPage.patientTechIdOrIPP.getText()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toContain(patientTechIdOrIPP)
	// })

	// // Retour sur la page "Données patients"
	// // -------------------------------------
	// it('Retour sur la page "Données patients"', () => {
	// 	/*Logger.log('Le bouton "back" est clickable')
	// 	expect(PatientDetailPage.backButton.waitForClickable()).withContext().toBe(true, '@ Le bouton "back" est clickable')
		
	// 	Logger.log('Click sur le bouton "back" : accès à la page "Données patients"')
	// 	PatientDetailPage.backButton.click()*/
	// 	browser.closeWindow()
	// 	browser.switchWindow(MyPatientDatasPage.getUrl())
	// 	expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patients" doit être : ' + MyPatientDatasPage.getUrl()).toBe(MyPatientDatasPage.getUrl())

	// 	Logger.log(PatientContextBar.accessLibValue + ' ' + MyPatientDatasPage.access)
	// 	expect(MyPatientDatasPage.access).withContext('@ ' + PatientContextBar.accessLibValue +  ' ' + MyPatientDatasPage.access).not.toBe(PatientContextBar.defaultAccessValue)

	// 	Logger.log('L\'onglet "Patients" est actif')
	// 	expect(MyPatientDatasPage.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Patients" est actif').toBe('true')
	// })

  // Déconnexion
	// -----------
	it('Déconnexion', async () => {
		Logger.log('Déconnexion')
		await MyPatientDatasPage.logout()
	})

})