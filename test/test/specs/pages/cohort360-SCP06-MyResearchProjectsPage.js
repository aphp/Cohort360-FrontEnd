const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')

const Page = MyResearchProjectsPage

describe('Cohort360 - SCP06 - Page "Mes requêtes"', () => {

    // Accès à la page "Mes requêtes"
	// ----------------------------------
	it('Accès à la page "Mes requêtes"', async () => {
		await Page.login()

		Logger.log('L\'URL de la page "Mes requêtes" doit être : ' + Page.getUrl())
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Mes requêtes" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

        Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
        expect(await Page.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + Page.titleValue + '"').toBe(true)
	})

   // Bloc liste de projets
	// --------------------
	it('Bloc liste de projets', async () => {
		Logger.log('Le bouton "' + Page.projectListBlock.addProjectButtonLabel + '" est clickable')
		expect(await Page.projectListBlock.addProjectButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addProjectButtonLabel + '" est clickable').toBe(true)
		
		await Page.projectListBlock.resetList()
		Page.projectListBlock.setCurrentProject(0)
		
		Logger.log('Le 1er projet de la liste est : ' + await Page.projectListBlock.currentProjectDisplayed())
		Logger.log('Le bouton "' + Page.projectListBlock.editProjectButtonLabel + '" est clickable')
		await Page.projectListBlock.currentProjectTitle.moveTo()
		expect(await Page.projectListBlock.currentProjectEditButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.editProjectButtonLabel + '" est clickable').toBe(true)

		if (await Page.projectListBlock.currentProjectRequest(0) != null) {
			Logger.log('Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable')
			await Page.projectListBlock.currentProjectTitle.moveTo()
			expect(await Page.projectListBlock.currentProjectAddRequestButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable').toBe(true)
			
			Logger.log('La 1ère requête du projet "' + await Page.projectListBlock.currentProjectTitle.getText() + '" est : ' + await Page.projectListBlock.currentProjectRequestDisplayed(0))
			Logger.log('Le bouton "' + Page.projectListBlock.editRequestButtonLabel + '" est clickable')
			await Page.projectListBlock.currentProjectRequestTitle(0).moveTo()
			expect(await Page.projectListBlock.currentProjectRequestEditButton(0).waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.editRequestButtonLabel + '" est clickable').toBe(true)
		}
		else {
			Logger.log('Le message "' + Page.projectListBlock.noRequestMessageValue + '" est affiché')
			expect(await Page.projectListBlock.currentProjectNoRequest.getText()).withContext('@ Le message "' + Page.projectListBlock.noRequestMessageValue + '" est affiché').toContain(Page.projectListBlock.noRequestMessageValue)

			Logger.log('Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable')
			expect(await Page.projectListBlock.currentProjectNoRequestAddButton.waitForClickable()).withContext('@ Le bouton "' + Page.projectListBlock.addRequestButtonLabel + '" est clickable').toBe(true)
		}
	})

    // Déconnexion
	// -----------
	it('Déconnexion', async () => {
		Logger.log('Déconnexion')
		await Page.logout()
	})

})