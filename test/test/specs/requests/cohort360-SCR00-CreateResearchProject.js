const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCR00 - Création du projet de recherche "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"', () => {

    // Accès à la page "Mes projets de recherche"
	// ------------------------------------------
	it('Accès à la page "Mes projets de recherche"', () => {
		MyResearchProjectsPage.login()

		Logger.log('L\'URL de la page "Mes projets de recherche" doit être : ' + MyResearchProjectsPage.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Mes projets de recherche" doit être : ' + MyResearchProjectsPage.getUrl()).toBe(MyResearchProjectsPage.getUrl())

        Logger.log('Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"')
        expect(MyResearchProjectsPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"').toBe(true)
	})

	// Affichage de la fenêtre modale
	// ------------------------------
	it('Affichage de la fenêtre modale "' + MyResearchProjectsPage.createProjectBox.titleValue + '"', () => {
		Logger.log('Le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel + '" est clickable')
		expect(MyResearchProjectsPage.projectListBlock.addProjectButton.waitForClickable()).withContext('@ Le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel + '" est clickable').toBe(true)
		
		Logger.log('Click sur le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel +'"')
		MyResearchProjectsPage.projectListBlock.addProjectButton.click()

		Logger.log('Ouverture de la fenêtre modale "' + MyResearchProjectsPage.createProjectBox.titleValue + '"')
		Logger.log('Le titre de la fenêtre modale est "' + MyResearchProjectsPage.createProjectBox.titleValue + '"')
		expect(MyResearchProjectsPage.createProjectBox.title.getText()).withContext('@ Le titre de la fenêtre modale est "' + MyResearchProjectsPage.createProjectBox.titleValue + '"').toBe(MyResearchProjectsPage.createProjectBox.titleValue)

		Logger.log('L\'input "' + MyResearchProjectsPage.createProjectBox.projectNameInputLabel + '" est affiché')
		expect(MyResearchProjectsPage.createProjectBox.projectNameInput.waitForClickable()).withContext('@ Le bouton "' + MyResearchProjectsPage.createProjectBox.projectNameInputLabel + '" est clickable').toBe(true)

		Logger.log('Le bouton "' + MyResearchProjectsPage.createProjectBox.cancelButtonValue + '" est clickable')
		expect(MyResearchProjectsPage.createProjectBox.cancelButton.waitForClickable()).withContext('@ Le bouton "' + MyResearchProjectsPage.createProjectBox.cancelButtonValue + '" est clickable').toBe(true)

		Logger.log('Le bouton "' + MyResearchProjectsPage.createProjectBox.createButtonValue + '" est clickable')
		expect(MyResearchProjectsPage.createProjectBox.createButton.waitForClickable()).withContext('@ Le bouton "' + MyResearchProjectsPage.createProjectBox.createButtonValue + '" est clickable').toBe(true)

		Logger.log('Fermeture de la fenêtre modale (click sur "' + MyResearchProjectsPage.createProjectBox.cancelButtonValue + '") "' + MyResearchProjectsPage.createProjectBox.titleValue + '"')
		MyResearchProjectsPage.createProjectBox.cancelButton.click()
	})

	// Création d'un projet de recherche
	// ---------------------------------
	it('Création du projet de recherche "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"', () => {
		Logger.log('Le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel + '" est clickable')
		expect(MyResearchProjectsPage.projectListBlock.addProjectButton.waitForClickable()).withContext('@ Le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel + '" est clickable').toBe(true)
		
		Logger.log('Click sur le bouton "' + MyResearchProjectsPage.projectListBlock.addProjectButtonLabel +'"')
		MyResearchProjectsPage.projectListBlock.addProjectButton.click()

		Logger.log('Nom du projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB +'"')
		while (MyResearchProjectsPage.createProjectBox.projectNameInput.getValue().length != 0) {
			MyResearchProjectsPage.createProjectBox.projectNameInput.doubleClick()
			browser.keys("Delete")
		}
		MyResearchProjectsPage.createProjectBox.projectNameInput.setValue(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)

		Logger.log('Création du projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB +'" (click sur "' + MyResearchProjectsPage.createProjectBox.createButtonValue + '")')
		MyResearchProjectsPage.createProjectBox.createButton.click()
		
		Logger.log('Le projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB +'" est bien créé')
		MyResearchProjectsPage.projectListBlock.resetList()
		var isProjectCreated = false
		for (var i=0; i<MyResearchProjectsPage.projectListBlock.allLineBlocks.length / 2; i++) {
			MyResearchProjectsPage.projectListBlock.setCurrentProject(i)
			if (MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText() == COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB) {
				MyResearchProjectsPage.projectListBlock.currentProjectTitle.scrollIntoView()
				isProjectCreated = true
				break
			}
		}
		expect(isProjectCreated).withContext('@ Le projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB +'" est bien créé').toBe(true)
		
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		MyResearchProjectsPage.logout()
	})

})