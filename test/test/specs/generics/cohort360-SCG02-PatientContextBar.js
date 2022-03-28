const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientsPage = require('../../pageObjects/MyPatientsPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCG02 - Barre de contexte "Mes patients"', () => {

  // Accès à la page "Mes patients"
	// ------------------------------
	it('Accès à la page "Tous mes patients" (authentification)', async () => {

    Logger.log('Accès à la page "Tous mes patients"')
    await MyPatientsPage.login()
		expect(await browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + MyPatientsPage.getUrl()).toBe(MyPatientsPage.getUrl())
  })
    
  it('Affichage de la barre de contexte', async () => {

    Logger.log('La barre de contexte est affichée')
    await PatientContextBar.accessValue() != PatientContextBar.defaultAccessValue
    expect(await PatientContextBar.contextBar.waitForDisplayed()).withContext('@ La barre de contexte est affichée').toBe(true)
  })

  it('Nombre de patients', async () => {

    Logger.log('Affichage de "' + PatientContextBar.nbPatientsLibValue + ' ' + await PatientContextBar.nbPatientsValue() + '"')
    expect(await PatientContextBar.nbPatients.waitForDisplayed()).withContext('@ Affichage de "' + PatientContextBar.nbPatientsLibValue + ' ' + await PatientContextBar.nbPatientsValue() + '"').toBe(true)
  })

  it('Accès', async () => {

    Logger.log('Affichage de "' + PatientContextBar.accessLibValue + ' ' + await PatientContextBar.accessValue() + '"')
    expect(await PatientContextBar.access.waitForDisplayed()).withContext('@ Affichage de "' + PatientContextBar.accessLibValue + ' ' + await PatientContextBar.accessValue() + '"').toBe(true)
  })

  // Déconnexion
	// -----------
	it('Déconnexion', async () => {
    
		Logger.log('Déconnexion')
		await MyPatientsPage.logout()
	})
})