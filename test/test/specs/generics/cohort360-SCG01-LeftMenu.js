const COHORT360_PARAMS = require('../../params/cohort360-param')
const LoginPage = require('../../pageObjects/LoginPage')
const HomePage = require('../../pageObjects/HomePage')
const LeftMenu = require('../../objects/LeftMenu')
const LoginLogout = require('../../objects/LoginLogout')
const NewCohortPage = require('../../pageObjects/NewCohortPage')
const SearchPatientPage = require('../../pageObjects/SearchPatientPage')
const MyPatientsPage = require('../../pageObjects/MyPatientsPage')
const ExplorePerimeterPage = require('../../pageObjects/ExplorePerimeterPage')
const SavedCohortsPage = require('../../pageObjects/SavedCohortsPage')
const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const PatientPage = require('../../pageObjects/PatientsPage')

describe('Cohort360 - SCG01 - Menu gauche', () => {

    // Accès à la page d'accueil
	// -------------------------
    it('Accès à la page d\'accueil (authentification)', async () => {

		await HomePage.login()
		console.log(`await browser.getUrl()`, await browser.getUrl())

		Logger.log('Le message de bienvenue est affiché')
		expect(await HomePage.welcomeMessage.waitForDisplayed()).withContext('@ Le message de bienvenue est affiché').toBe(true)

		Logger.log('L\'URL de la page d\'accueil doit être : ' + HomePage.getUrl())
		expect(await browser.getUrl()).withContext('@ L\'URL de la page d\'accueil doit être : ' + HomePage.getUrl()).toBe(HomePage.getUrl())
	})
	
	it('Ouverture/Réduction menu gauche', async () => {
		
		await LeftMenu.open()

		Logger.log('Réduction du menu gauche')
		await LeftMenu.reduce()
		expect(await LeftMenu.isReduced()).withContext('@ Réduction du menu gauche').toBe(true)

		Logger.log('Ouverture du menu gauche')
		await LeftMenu.open()
		expect(await LeftMenu.isOpened()).withContext('@ Ouverture du menu gauche').toBe(true)
	})

	it('Nouvelle cohorte', async () => {
		
		await LeftMenu.open()

		Logger.log('Affichage du bouton "Nouvelle Cohorte" (menu gauche ouvert)')
		expect(await LeftMenu.newCohortButton.isDisplayed() && await LeftMenu.newCohortButton.isClickable()).withContext('@ Affichage du bouton "Nouvelle Cohorte" (menu gauche ouvert)').toBe(true)

		Logger.log('Accès à la page "Nouvelle Cohorte" (via le bouton)')
		await LeftMenu.newCohort()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Nouvelle Cohorte" doit être : ' + NewCohortPage.getUrl()).toBe(NewCohortPage.getUrl())

		await HomePage.open()
		await LeftMenu.reduce()

		Logger.log('Affichage du lien "+" (menu gauche réduit)')
		expect(await LeftMenu.newCohortPlusLink.isDisplayed() && await LeftMenu.newCohortPlusLink.isClickable()).withContext('@ Affichage du lien "+" (menu gauche réduit)').toBe(true)

		Logger.log('Accès à la page "Nouvelle Cohorte" (via le lien "+")')
		await LeftMenu.newCohort()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Nouvelle Cohorte" doit être : ' + NewCohortPage.getUrl()).toBe(NewCohortPage.getUrl())

		await HomePage.open()
		await LeftMenu.reduce()
	})

	it('Accueil', async () => {
		
		await LeftMenu.open()

		Logger.log('Affichage du bouton/lien "Accueil"')
		expect(await LeftMenu.homeButton.isDisplayed() && await LeftMenu.homeButton.isClickable()).withContext('@ Affichage du bouton/lien "Accueil"').toBe(true)		

		Logger.log('Accès à la page d\'accueil')
		await LeftMenu.homeButton.click()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page d\'accueil doit être : ' + HomePage.getUrl()).toBe(HomePage.getUrl())

		await LeftMenu.reduce()
	})

	it('Ouverture/Réduction du sous-menu "Mes patients"', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyPatientsMenu()

		Logger.log('Réduction du sous-menu "Mes patients"')
		await LeftMenu.reduceMyPatientsMenu()
		expect(await LeftMenu.myPatientsBlock.isExisting()).withContext('@ Réduction du sous-menu "Mes patients"').toBe(false)

		Logger.log('Ouverture du sous-menu "Mes patients"')
		await LeftMenu.openMyPatientsMenu()
		expect(await LeftMenu.myPatientsBlock.isExisting()).withContext('@ Ouverture du sous-menu "Mes patients"').toBe(true)
		
		await LeftMenu.reduceMyPatientsMenu()
		await LeftMenu.reduce()
	})

	it('Ouverture/Réduction du sous-menu "Mes recherches"', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyResearchMenu()

		Logger.log('Réduction du sous-menu "Mes recherches"')
		await LeftMenu.reduceMyResearchMenu()
		expect(await LeftMenu.myResearchBlock.isExisting()).withContext('@ Réduction du sous-menu "Mes recherches"').toBe(false)

		Logger.log('Ouverture du sous-menu "Mes recherches"')
		await LeftMenu.openMyResearchMenu()
		expect(await LeftMenu.myResearchBlock.isExisting()).withContext('@ Ouverture du sous-menu "Mes recherches"').toBe(true)

		await LeftMenu.reduceMyResearchMenu()
		await LeftMenu.reduce()
	})

	it('Mes patients > Rechercher un patient', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyPatientsMenu()

		Logger.log('Affichage du lien "Rechercher un patient"')
		expect(await LeftMenu.myPatientsSearchLink.isDisplayed() /*&& await LeftMenu.myPatientsSearchLink.isClickable()*/).withContext('@ Affichage du lien "Rechercher un patient"').toBe(true)		
		
		Logger.log('Accès à la page "Rechercher un patient"')
		await LeftMenu.myPatientsSearchLink.click()
		expect(await browser.getUrl()).withContext().toBe(SearchPatientPage.getUrl())

		Logger.log('Le titre de la page est : "' + SearchPatientPage.titleValue + '"')
        expect(await SearchPatientPage.title.waitForDisplayed()).withContext('@ L\'URL de la page "Rechercher un patient" doit être : ' + SearchPatientPage.getUrl()).toBe(true, '@ Le titre de la page est : "' + SearchPatientPage.titleValue + '"')

		await LeftMenu.reduceMyPatientsMenu()
		await LeftMenu.reduce()
	})
	
	it('Mes patients > Tous mes patients', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyPatientsMenu()

		Logger.log('Affichage du lien "Tous mes patients"')
		expect(await LeftMenu.myPatientsAllLink.isDisplayed() && await LeftMenu.myPatientsAllLink.isClickable()).withContext('@ Affichage du lien "Tous mes patients"').toBe(true)		
		
		Logger.log('Accès à la page "Tous mes patients"')
		await LeftMenu.myPatientsAllLink.click()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + MyPatientsPage.getUrl()).toBe(MyPatientsPage.getUrl())

		Logger.log('L\'onglet "Aperçu" est actif')
		expect(await MyPatientsPage.previewTab.getAttribute('aria-selected')).withContext('@ L\'onglet "Aperçu" est actif').toBe('true', )

		await LeftMenu.reduceMyPatientsMenu()
		await LeftMenu.reduce()
	})

	it('Mes patients > Explorer un périmètre', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyPatientsMenu()

		Logger.log('Affichage du lien "Explorer un périmètre"')
		expect(await LeftMenu.myPatientsAllLink.isDisplayed() && await LeftMenu.myPatientsAllLink.isClickable()).withContext().toBe(true, '@ Affichage du lien "Explorer un périmètre"')		
		
		Logger.log('Accès à la page "Explorer un périmètre"')
		await LeftMenu.myPatientsExplorePerimeterLink.click()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Explorer un périmètre" doit être : ' + ExplorePerimeterPage.getUrl()).toBe(ExplorePerimeterPage.getUrl())

		Logger.log('Le titre de la page est : "' + ExplorePerimeterPage.titleValue + '"')
        expect(await ExplorePerimeterPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + ExplorePerimeterPage.titleValue + '"').toBe(true)

		await LeftMenu.reduceMyPatientsMenu()
		await LeftMenu.reduce()
	})

	it('Mes recherches > Recherches sauvegardées', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyResearchMenu()

		Logger.log('Affichage du lien "Recherches sauvegardées"')
		expect(await LeftMenu.myResearchSavedLink.isDisplayed() /*&& await LeftMenu.myResearchSavedLink.isClickable()*/).withContext('@ Affichage du lien "Recherches sauvegardées"').toBe(true)		
		
		Logger.log('Accès à la page "Recherches sauvegardées"')
		await LeftMenu.myResearchSavedLink.click()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Recherches sauvegardées" doit être : ' + SavedCohortsPage.getUrl()).toBe(SavedCohortsPage.getUrl())

		Logger.log('Le titre de la page est : "' + SavedCohortsPage.titleValue + '"')
        expect(await SavedCohortsPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + SavedCohortsPage.titleValue + '"').toBe(true)

		await LeftMenu.reduceMyResearchMenu()
		await LeftMenu.reduce()
	})

	it('Mes recherches > Mes requêtes', async () => {
		
		await LeftMenu.open()
		await LeftMenu.openMyResearchMenu()

		Logger.log('Affichage du lien "Mes requêtes"')
		expect(await LeftMenu.myResearchProjectLink.isDisplayed() /*&& await LeftMenu.myResearchProjectLink.isClickable()*/).withContext('@ Affichage du lien "Mes requêtes"').toBe(true)		
		
		Logger.log('Accès à la page "Mes requêtes"')
		await LeftMenu.myResearchProjectLink.click()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Mes requêtes" doit être : ' + MyResearchProjectsPage.getUrl()).toBe(MyResearchProjectsPage.getUrl())
		
		Logger.log('Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"')
        expect(await MyResearchProjectsPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"').toBe(true)

		await LeftMenu.reduceMyResearchMenu()
		await LeftMenu.reduce()
	})

    // Déconnexion
	// -----------
	it('Déconnexion', async () => {
		
		Logger.log('Déconnexion')
		await LoginLogout.logout()
	})
})