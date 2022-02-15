const MyPatientsPage = require('../../pageObjects/MyPatientsPage')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')

describe('Cohort360 - SCP02 - Page "Mes patients"', () => {

  // Accès à la page "Mes patients"
	// ------------------------------
	it('Accès à la page "Tous mes patients" (authentification)', async () => {

    Logger.log('Accès à la page "Tous mes patients"')
    await MyPatientsPage.login()
	  expect(await browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + MyPatientsPage.getUrl()).toBe(MyPatientsPage.getUrl())

	// Logger.log(PatientContextBar.accessLibValue + ' ' + await MyPatientsPage.access())
	// expect(MyPatientsPage.access()).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + MyPatientsPage.access).not.toBe(PatientContextBar.defaultAccessValue)

	// Logger.log('L\'onglet "Aperçu" est actif')
	// expect(await MyPatientsPage.previewTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Aperçu" est actif').toBe('true')
	})

	// Bloc "Nombre de patients"
	// -------------------------
	it('Bloc "Nombre de patients"', async () => {
		Logger.log('Le bloc "Nombre de patients" est affiché')
		expect(await MyPatientsPage.nbPatientsBlock.block.waitForDisplayed()).withContext('@ Le bloc "Nombre de patients" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.nbPatientsBlock.titleValue + '"')
		expect(await MyPatientsPage.nbPatientsBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.nbPatientsBlock.titleValue + '"').toBe(MyPatientsPage.nbPatientsBlock.titleValue)

		Logger.log('Le nombre de patients est affiché : ' + await MyPatientsPage.nbPatientsBlock.value.getText())
		expect(await MyPatientsPage.nbPatientsBlock.value.getText()).withContext('@ Le nombre de patients est affiché : ' + await MyPatientsPage.nbPatientsBlock.value.getText()).not.toBe("")
	})

	// Bloc "Statut vital"
	// -------------------
	it('Bloc "Statut vital"', async () => {
		Logger.log('Le bloc "Statut vital" est affiché')
		expect(await MyPatientsPage.vitalStatusBlock.block.waitForDisplayed()).withContext('@ Le bloc "Statut vital" est affiché').toBe(true)

		Logger.log('Le nombre de femmes vivantes est affiché : ' + await MyPatientsPage.vitalStatusBlock.aliveFemales.getText())
		expect(await MyPatientsPage.vitalStatusBlock.aliveFemales.getText()).withContext('@ Le nombre de femmes vivantes est affiché : ' + await MyPatientsPage.vitalStatusBlock.aliveFemales.getText()).not.toBe("")

		Logger.log('Le nombre de femmes décédées est affiché : ' + await MyPatientsPage.vitalStatusBlock.deadFemales.getText())
		expect(await MyPatientsPage.vitalStatusBlock.deadFemales.getText()).withContext('@ Le nombre de femmes décédées est affiché : ' + await MyPatientsPage.vitalStatusBlock.deadFemales.getText()).not.toBe("")

		Logger.log('Le nombre d\'hommes vivants est affiché : ' + await MyPatientsPage.vitalStatusBlock.aliveMales.getText())
		expect(await MyPatientsPage.vitalStatusBlock.aliveMales.getText()).withContext('@ Le nombre d\'hommes vivants est affiché : ' + await MyPatientsPage.vitalStatusBlock.aliveMales.getText()).not.toBe("")

		Logger.log('Le nombre d\'hommes décédés est affiché : ' + await MyPatientsPage.vitalStatusBlock.deadMales.getText())
		expect(await MyPatientsPage.vitalStatusBlock.deadMales.getText()).withContext('@ Le nombre d\'hommes décédés est affiché : ' + await MyPatientsPage.vitalStatusBlock.deadMales.getText()).not.toBe("")
	})

	// Bloc "Répartition par statut vital"
	// -----------------------------------
	it('Bloc "Répartition par statut vital"', async () => {
		Logger.log('Le bloc "Répartition par statut vital" est affiché')
		expect(await MyPatientsPage.vitalStatusDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par statut vital" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.vitalStatusDistribBlock.titleValue + '"')
		expect(await MyPatientsPage.vitalStatusDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.vitalStatusDistribBlock.titleValue + '"').toBe(MyPatientsPage.vitalStatusDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(await MyPatientsPage.vitalStatusDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition par type de visite"
	// -----------------------------------
	it('Bloc "Répartition par type de visite"', async () => {
		Logger.log('Le bloc "Répartition par type de visite" est affiché')
		expect(await MyPatientsPage.visitTypeDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par type de visite" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.visitTypeDistribBlock.titleValue + '"')
		expect(await MyPatientsPage.visitTypeDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.visitTypeDistribBlock.titleValue + '"').toBe(MyPatientsPage.visitTypeDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(await MyPatientsPage.visitTypeDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition par genre"
	// ----------------------------
	it('Bloc "Répartition par genre"', async () => {
		Logger.log('Le bloc "Répartition par genre" est affiché')
		expect(await MyPatientsPage.genderDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par genre" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.genderDistribBlock.titleValue + '"')
		expect(await MyPatientsPage.genderDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.genderDistribBlock.titleValue + '"').toBe(MyPatientsPage.genderDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(await MyPatientsPage.genderDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// // Bloc "Pyramide des âges"
	// // ------------------------
	// it('Bloc "Pyramide des âges"', () => {
	// 	Logger.log('Le bloc "Pyramide des âges" est affiché')
	// 	expect(MyPatientsPage.ageStructureBlock.block.waitForDisplayed()).withContext('@ Le bloc "Pyramide des âges" est affiché').toBe(true)

	// 	Logger.log('Le tire du bloc doit être "' + MyPatientsPage.ageStructureBlock.titleValue + '"')
	// 	expect(MyPatientsPage.ageStructureBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.ageStructureBlock.titleValue + '"').toBe(MyPatientsPage.ageStructureBlock.titleValue)

	// 	Logger.log('Le graphique est affiché')
	// 	expect(MyPatientsPage.ageStructureBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	// })

	// // Bloc "Répartition des visites par mois"
	// // ---------------------------------------
	// it('Bloc "Répartition des visites par mois"', () => {
	// 	Logger.log('Le bloc "Répartition des visites par mois" est affiché')
	// 	expect(MyPatientsPage.visitsPerMonthDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition des visites par mois" est affiché').toBe(true)

	// 	Logger.log('Le tire du bloc doit être "' + MyPatientsPage.visitsPerMonthDistribBlock.titleValue + '"')
	// 	expect(MyPatientsPage.visitsPerMonthDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.visitsPerMonthDistribBlock.titleValue + '"').toBe(MyPatientsPage.visitsPerMonthDistribBlock.titleValue)

	// 	Logger.log('Le graphique est affiché')
	// 	expect(MyPatientsPage.visitsPerMonthDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	// })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		MyPatientsPage.logout()
	})
	
})