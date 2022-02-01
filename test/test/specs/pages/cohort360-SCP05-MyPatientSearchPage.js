const SearchPatientPage = require('../../pageObjects/SearchPatientPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCP05 - Page "Rechercher un patient"', () => {
	 
	// Accès à la page "Rechercher un patient"
	// ---------------------------------------
	it('Accès à la page "Rechercher un patient" (authentification)', () => {
        Logger.log('Accès à la page "' + SearchPatientPage.titleValue + '"')
        SearchPatientPage.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + SearchPatientPage.getUrl()).toBe(SearchPatientPage.getUrl())

        Logger.log('Le titre de la page est : "' + SearchPatientPage.titleValue + '"')
        expect(SearchPatientPage.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + SearchPatientPage.titleValue + '"').toBe(true)
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		SearchPatientPage.logout()
	})
	
})