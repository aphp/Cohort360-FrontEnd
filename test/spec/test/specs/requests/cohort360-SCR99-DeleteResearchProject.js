const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCR99 - Suppression du projet de recherche "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"', () => {

    // Accès à la page "Mes projets de recherche"
	// ------------------------------------------
	it('Accès à la page "Mes projets de recherche"', () => {
		MyResearchProjectsPage.login()

		Logger.log('L\'URL de la page "Mes projets de recherche" doit être : ' + MyResearchProjectsPage.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Mes projets de recherche" doit être : ' + MyResearchProjectsPage.getUrl()).toBe(MyResearchProjectsPage.getUrl())

        Logger.log('Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"')
        expect(MyResearchProjectsPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + MyResearchProjectsPage.titleValue + '"').toBe(true)
	})

	// Suppression d'un projet de recherche
	// ------------------------------------
	it('Suppression du projet de recherche "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"', () => {
		MyResearchProjectsPage.projectListBlock.resetList()
		
		for (var i=0; i<MyResearchProjectsPage.projectListBlock.allLineBlocks.length / 2; i++) {
			MyResearchProjectsPage.projectListBlock.setCurrentProject(i)

			if (MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText().indexOf(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB) != -1) {
				
				Logger.log('Edition du projet "' + MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText() + '" (click sur le bouton "' + MyResearchProjectsPage.projectListBlock.editProjectButtonLabel + '")')
				MyResearchProjectsPage.projectListBlock.currentProjectTitle.scrollIntoView()
				MyResearchProjectsPage.projectListBlock.currentProjectTitle.moveTo()
				MyResearchProjectsPage.projectListBlock.currentProjectEditButton.click()
				Logger.log('La fenêtre modale "' + MyResearchProjectsPage.editProjectBox.titleValue + '" est affichée')
				expect(MyResearchProjectsPage.editProjectBox.title.waitForDisplayed()).withContext('@ La fenêtre modale "' + MyResearchProjectsPage.editProjectBox.titleValue + '" est affichée').toBe(true)

				Logger.log('Suppression du projet "' + MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText() + '" (click sur le bouton "' + MyResearchProjectsPage.editProjectBox.deleteButtonValue + '")')
				MyResearchProjectsPage.editProjectBox.deleteButton.click()
				Logger.log('La fenêtre modale "' + MyResearchProjectsPage.deleteProjectBox.titleValue + '" est affichée')
				expect(MyResearchProjectsPage.deleteProjectBox.title.waitForDisplayed()).withContext('@ La fenêtre modale "' + MyResearchProjectsPage.deleteProjectBox.titleValue + '" est affichée').toBe(true)

				Logger.log('Confirmation de la suppression du projet "' + MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText() + '" (click sur le bouton "' + MyResearchProjectsPage.deleteProjectBox.deleteButtonValue + '")')
				MyResearchProjectsPage.deleteProjectBox.deleteButton.click()

				i--

				MyResearchProjectsPage.projectListBlock.resetList()
			}
		}

		MyResearchProjectsPage.projectListBlock.resetList()
		MyResearchProjectsPage.projectListBlock.setCurrentProject(0)
		
		Logger.log('Le titre du 1er projet de la liste doit être différent de : ' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)
		expect(MyResearchProjectsPage.projectListBlock.currentProjectTitle.getText()).withContext('@ Le titre du 1er projet de la liste doit être différent de : ' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB).not.toBe(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		MyResearchProjectsPage.logout()
	})

})