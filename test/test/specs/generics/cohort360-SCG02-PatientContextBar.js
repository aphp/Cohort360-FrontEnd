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
    // PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
    await PatientContextBar.access().waitUntil(() => PatientContextBar.accessValue() != PatientContextBar.defaultAccessValue)
    expect(await PatientContextBar.contextBar.waitForDisplayed()).withContext('@ La barre de contexte est affichée').toBe(true)
  })

  /*it('Titre', () => {
    Logger.log('Affichage de "' + PatientContextBar.titleLibValue + ' : ' + PatientContextBar.titleValue.getText() + '"')
    expect(PatientContextBar.titleLib.getText()).withContext('@ Affichage de "' + PatientContextBar.titleLibValue + '"').toBe(PatientContextBar.titleLibValue)
    expect(PatientContextBar.titleValue.isDisplayed()).withContext('@ Affichage de "' + PatientContextBar.titleLibValue + ' : ' + PatientContextBar.titleValue.getText() + '"').toBe(true)
  })

    it('Statut', () => {
        Logger.log('Affichage de "' + PatientContextBar.statusLibValue + ' : ' + PatientContextBar.statusValue.getText() + '"')
        expect(PatientContextBar.statusLib.getText()).withContext('@ Affichage de "' + PatientContextBar.statusLibValue + '"').toBe(PatientContextBar.statusLibValue)
        expect(PatientContextBar.statusValue.isDisplayed()).withContext('@ Affichage de "' + PatientContextBar.statusLibValue + ' : ' + PatientContextBar.statusValue.getText() + '"').toBe(true)
    })*/

  it('Nombre de patients', async () => {
    Logger.log('Affichage de "' + PatientContextBar.nbPatientsLibValue + ' ' + PatientContextBar.nbPatientsValue + '"')
    /*expect(PatientContextBar.nbPatientsLib.getText()).withContext('@ Affichage de "' + PatientContextBar.nbPatientsLibValue + '"').toBe(PatientContextBar.nbPatientsLibValue)
    expect(PatientContextBar.nbPatientsValue.waitForDisplayed()).withContext('@ Affichage de "' + PatientContextBar.nbPatientsLibValue + ' : ' + PatientContextBar.nbPatientsValue.getText() + '"').toBe(true)*/
    // expect(PatientContextBar.nbPatientsLib).withContext('@ Affichage de "' + PatientContextBar.nbPatientsLibValue + '"').toBe(PatientContextBar.nbPatientsLibValue)
    expect(await PatientContextBar.nbPatients.waitForDisplayed()).withContext('@ Affichage de "' + PatientContextBar.nbPatientsLibValue + ' ' + PatientContextBar.nbPatientsValue + '"').toBe(true)
  })

  it('Accès', async () => {
    Logger.log('Affichage de "' + PatientContextBar.accessLibValue + ' ' + PatientContextBar.accessValue + '"')
    /*expect(PatientContextBar.accessLib.getText()).withContext('@ Affichage de "' + PatientContextBar.accessLibValue + '"').toBe(PatientContextBar.accessLibValue)
    expect(PatientContextBar.accessValue.isDisplayed()).withContext('@ Affichage de "' + PatientContextBar.accessLibValue + ' : ' + PatientContextBar.accessValue.getText() + '"').toBe(true)*/
    // expect(PatientContextBar.accessLib).withContext('@ Affichage de "' + PatientContextBar.accessLibValue + '"').toBe(PatientContextBar.accessLibValue)
    expect(await PatientContextBar.access.waitForDisplayed()).withContext('@ Affichage de "' + PatientContextBar.accessLibValue + ' ' + PatientContextBar.accessValue + '"').toBe(true)
  })

  // Déconnexion
	// -----------
	it('Déconnexion', async () => {
		Logger.log('Déconnexion')
		await MyPatientsPage.logout()
	})
})