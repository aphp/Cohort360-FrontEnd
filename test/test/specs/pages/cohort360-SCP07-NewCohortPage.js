const NewCohortPage = require('../../pageObjects/NewCohortPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCP07 - Page "Nouvelle cohorte"', () => {

    // Accès à la page "Nouvelle cohorte"
	// ----------------------------------
	it('Accès à la page "Nouvelle Cohorte"', () => {
		NewCohortPage.login()

		Logger.log('L\'URL de la page "Nouvelle Cohorte" doit être : ' + NewCohortPage.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Nouvelle Cohorte" doit être : ' + NewCohortPage.getUrl()).toBe(NewCohortPage.getUrl())

        Logger.log('Le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '" est clickable')
		expect(NewCohortPage.sourcePopulationChoiceButton.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '" est clickable').toBe(true)
	})

    // Choix de la / des structure(s) hospitalière(s)
	// ----------------------------------------------
	it('Choix de la / des structure(s) hospitalière(s)', () => {
        Logger.log('Click sur le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '"')
        NewCohortPage.sourcePopulationChoiceButton.click()
        
    })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		NewCohortPage.logout()
	})

})