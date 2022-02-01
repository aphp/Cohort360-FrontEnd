const MyPatientsPage = require('../../pageObjects/MyPatientsPage')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')

describe('Cohort360 - SCP02 - Page "Mes patients"', () => {

    // Accès à la page "Mes patients"
	// ------------------------------
	it('Accès à la page "Tous mes patients" (authentification)', () => {
        Logger.log('Accès à la page "Tous mes patients"')
        MyPatientsPage.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + MyPatientsPage.getUrl()).toBe(MyPatientsPage.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + MyPatientsPage.access)
		expect(MyPatientsPage.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + MyPatientsPage.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "Aperçu" est actif')
		expect(MyPatientsPage.previewTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Aperçu" est actif').toBe('true')
	})

	// Bloc "Nombre de patients"
	// -------------------------
	it('Bloc "Nombre de patients"', () => {
		Logger.log('Le bloc "Nombre de patients" est affiché')
		expect(MyPatientsPage.nbPatientsBlock.block.waitForDisplayed()).withContext('@ Le bloc "Nombre de patients" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.nbPatientsBlock.titleValue + '"')
		expect(MyPatientsPage.nbPatientsBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.nbPatientsBlock.titleValue + '"').toBe(MyPatientsPage.nbPatientsBlock.titleValue)

		Logger.log('Le nombre de patients est affiché : ' + MyPatientsPage.nbPatientsBlock.value.getText())
		expect(MyPatientsPage.nbPatientsBlock.value.getText()).withContext('@ Le nombre de patients est affiché : ' + MyPatientsPage.nbPatientsBlock.value.getText()).not.toBe("")
	})

	// Bloc "Statut vital"
	// -------------------
	it('Bloc "Statut vital"', () => {
		Logger.log('Le bloc "Statut vital" est affiché')
		expect(MyPatientsPage.vitalStatusBlock.block.waitForDisplayed()).withContext('@ Le bloc "Statut vital" est affiché').toBe(true)

		Logger.log('Le nombre de femmes vivantes est affiché : ' + MyPatientsPage.vitalStatusBlock.aliveFemales.getText())
		expect(MyPatientsPage.vitalStatusBlock.aliveFemales.getText()).withContext('@ Le nombre de femmes vivantes est affiché : ' + MyPatientsPage.vitalStatusBlock.aliveFemales.getText()).not.toBe("")

		Logger.log('Le nombre de femmes décédées est affiché : ' + MyPatientsPage.vitalStatusBlock.deadFemales.getText())
		expect(MyPatientsPage.vitalStatusBlock.deadFemales.getText()).withContext('@ Le nombre de femmes décédées est affiché : ' + MyPatientsPage.vitalStatusBlock.deadFemales.getText()).not.toBe("")

		Logger.log('Le nombre d\'hommes vivants est affiché : ' + MyPatientsPage.vitalStatusBlock.aliveMales.getText())
		expect(MyPatientsPage.vitalStatusBlock.aliveMales.getText()).withContext('@ Le nombre d\'hommes vivants est affiché : ' + MyPatientsPage.vitalStatusBlock.aliveMales.getText()).not.toBe("")

		Logger.log('Le nombre d\'hommes décédés est affiché : ' + MyPatientsPage.vitalStatusBlock.deadMales.getText())
		expect(MyPatientsPage.vitalStatusBlock.deadMales.getText()).withContext('@ Le nombre d\'hommes décédés est affiché : ' + MyPatientsPage.vitalStatusBlock.deadMales.getText()).not.toBe("")
	})

	// Bloc "Répartition par statut vital"
	// -----------------------------------
	it('Bloc "Répartition par statut vital"', () => {
		Logger.log('Le bloc "Répartition par statut vital" est affiché')
		expect(MyPatientsPage.vitalStatusDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par statut vital" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.vitalStatusDistribBlock.titleValue + '"')
		expect(MyPatientsPage.vitalStatusDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.vitalStatusDistribBlock.titleValue + '"').toBe(MyPatientsPage.vitalStatusDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(MyPatientsPage.vitalStatusDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition par type de visite"
	// -----------------------------------
	it('Bloc "Répartition par type de visite"', () => {
		Logger.log('Le bloc "Répartition par type de visite" est affiché')
		expect(MyPatientsPage.visitTypeDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par type de visite" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.visitTypeDistribBlock.titleValue + '"')
		expect(MyPatientsPage.visitTypeDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.visitTypeDistribBlock.titleValue + '"').toBe(MyPatientsPage.visitTypeDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(MyPatientsPage.visitTypeDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition par genre"
	// ----------------------------
	it('Bloc "Répartition par genre"', () => {
		Logger.log('Le bloc "Répartition par genre" est affiché')
		expect(MyPatientsPage.genderDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition par genre" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.genderDistribBlock.titleValue + '"')
		expect(MyPatientsPage.genderDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.genderDistribBlock.titleValue + '"').toBe(MyPatientsPage.genderDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(MyPatientsPage.genderDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Pyramide des âges"
	// ------------------------
	it('Bloc "Pyramide des âges"', () => {
		Logger.log('Le bloc "Pyramide des âges" est affiché')
		expect(MyPatientsPage.ageStructureBlock.block.waitForDisplayed()).withContext('@ Le bloc "Pyramide des âges" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.ageStructureBlock.titleValue + '"')
		expect(MyPatientsPage.ageStructureBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.ageStructureBlock.titleValue + '"').toBe(MyPatientsPage.ageStructureBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(MyPatientsPage.ageStructureBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

	// Bloc "Répartition des visites par mois"
	// ---------------------------------------
	it('Bloc "Répartition des visites par mois"', () => {
		Logger.log('Le bloc "Répartition des visites par mois" est affiché')
		expect(MyPatientsPage.visitsPerMonthDistribBlock.block.waitForDisplayed()).withContext('@ Le bloc "Répartition des visites par mois" est affiché').toBe(true)

		Logger.log('Le tire du bloc doit être "' + MyPatientsPage.visitsPerMonthDistribBlock.titleValue + '"')
		expect(MyPatientsPage.visitsPerMonthDistribBlock.title.getText()).withContext('@ Le tire du bloc doit être "' + MyPatientsPage.visitsPerMonthDistribBlock.titleValue + '"').toBe(MyPatientsPage.visitsPerMonthDistribBlock.titleValue)

		Logger.log('Le graphique est affiché')
		expect(MyPatientsPage.visitsPerMonthDistribBlock.graph.waitForDisplayed()).withContext('@ Le graphique est affiché').toBe(true)
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		MyPatientsPage.logout()
	})
	
})