const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')

const Page = MyResearchProjectsPage

describe('Cohort360 - SCP06 - Page "Mes projets de recherche"', () => {

    // Accès à la page "Mes projets de recherche"
	// ----------------------------------
	it('Accès à la page "Mes projets de recherche"', () => {
		Page.login()

		Logger.log('L\'URL de la page "Mes projets de recherche" doit être : ' + Page.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Mes projets de recherche" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

        Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
        expect(Page.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + Page.titleValue + '"').toBe(true)
	})

   // Bloc liste de projets
	// --------------------
	it('Bloc liste de projets', () => {
		Logger.log('Le bouton "' + Page.projectListBlock.addProjectButtonLabel + '" est clickable')
		expect(Page.projectListBlock.addProjectButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addProjectButtonLabel + '" est clickable').toBe(true)
		
		Page.projectListBlock.resetList()
		Page.projectListBlock.setCurrentProject(0)
		
		Logger.log('Le 1er projet de la liste est : ' + Page.projectListBlock.currentProjectDisplayed)
		Logger.log('Le bouton "' + Page.projectListBlock.editProjectButtonLabel + '" est clickable')
		Page.projectListBlock.currentProjectTitle.moveTo()
		expect(Page.projectListBlock.currentProjectEditButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.editProjectButtonLabel + '" est clickable').toBe(true)

		if (Page.projectListBlock.currentProjectRequest(0) != null) {
			Logger.log('Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable')
			Page.projectListBlock.currentProjectTitle.moveTo()
			expect(Page.projectListBlock.currentProjectAddRequestButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable').toBe(true)
			
			Logger.log('La 1ère requête du projet "' + Page.projectListBlock.currentProjectTitle.getText() + '" est : ' + Page.projectListBlock.currentProjectRequestDisplayed(0))
			Logger.log('Le bouton "' + Page.projectListBlock.editRequestButtonLabel + '" est clickable')
			Page.projectListBlock.currentProjectRequestTitle(0).moveTo()
			expect(Page.projectListBlock.currentProjectRequestEditButton(0).waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.editRequestButtonLabel + '" est clickable').toBe(true)
		}
		else {
			Logger.log('Le message "' + Page.projectListBlock.noRequestMessageValue + '" est affiché')
			expect(Page.projectListBlock.currentProjectNoRequest.getText()).withContext('@ Le message "' + Page.projectListBlock.noRequestMessageValue + '" est affiché').toContain(Page.projectListBlock.noRequestMessageValue)

			Logger.log('Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable')
			expect(Page.projectListBlock.currentProjectNoRequestAddButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable').toBe(true)
		}
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})

})