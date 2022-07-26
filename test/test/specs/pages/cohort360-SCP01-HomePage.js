const HomePage = require('../../pageObjects/HomePage')
const Logger = require('../../objects/Logger')

describe("Cohort360 - SCP01 - Page d'accueil", () => {
  // Accès à la page d'accueil
  // -------------------------
  it("Accès à la page d'accueil (authentification)", async () => {

    await HomePage.login()

    Logger.log('Affichage de la mention : ' + (await HomePage.welcomeMessage.getText()))
    expect(await HomePage.welcomeMessage.waitForDisplayed()).withContext('@ Affichage du message : ' + (await HomePage.welcomeMessage.getText())).toBe(true)

    Logger.log('Affichage de la mention : ' + (await HomePage.lastConnectionMessage.getText()))
    expect(await HomePage.lastConnectionMessage.waitForDisplayed()).withContext('@ Affichage du message : ' + (await HomePage.lastConnectionMessage)).toBe(true)

    Logger.log("L'URL de la page d'accueil doit être : " + HomePage.getUrl())
    expect(await browser.getUrl()).withContext("@ L'URL de la page d'accueil doit être : " + HomePage.getUrl()).toBe(HomePage.getUrl())
  })

  // Bloc "Patients pris en charge"
  // ------------------------------
  it('Bloc "Patients pris en charge"', async () => {

    Logger.log('Le titre du bloc doit contenir "' + HomePage.patientBlock.nbPatientsTitleValue + '"')
    expect(await HomePage.patientBlock.nbPatientsTitle.isDisplayed()).withContext('@ Le titre du bloc doit contenir "' + HomePage.patientBlock.nbPatientsTitleValue + '"').toBe(true)
    expect(await HomePage.patientBlock.nbPatientsTitle.getText()).withContext('@ Le titre du bloc doit contenir "' + HomePage.patientBlock.nbPatientsTitleValue + '"').toContain(HomePage.patientBlock.nbPatientsTitleValue)

    Logger.log('Le bouton "' + HomePage.patientBlock.exploreAllPatientsButtonValue + '" doit être clickable')
    expect(await HomePage.patientBlock.exploreAllPatientsButton.isClickable()).withContext('@ Le bouton "' + HomePage.patientBlock.exploreAllPatientsButtonValue + '" doit être clickable').toBe(true)

    Logger.log('Le bouton "' + HomePage.patientBlock.explorePerimeterButtonValue + '" doit être clickable')
    expect(await HomePage.patientBlock.explorePerimeterButton.isClickable()).withContext('@ Le bouton "' + HomePage.patientBlock.explorePerimeterButtonValue + '" doit être clickable').toBe(true)
  })

  // Bloc "Explorer les données d'un patient pris en charge"
  // -------------------------------------------------------
  it('Bloc "Explorer les données d\'un patient pris en charge"', async () => {

    Logger.log('Le titre du bloc doit être "' + HomePage.searchBlock.titleValue + '"')
    expect(await HomePage.searchBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.searchBlock.titleValue + '"').toBe(true)
    expect(await HomePage.searchBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.searchBlock.titleValue + '"').toBe(HomePage.searchBlock.titleValue)

    Logger.log('L\'input "' + HomePage.searchBlock.inputPlaceHolderValue + '" est affiché')
    expect(await HomePage.searchBlock.input.isDisplayed()).withContext('@ L\'input "' + HomePage.searchBlock.inputPlaceHolderValue + '" est affiché').toBe(true)
    expect(await HomePage.searchBlock.input.getAttribute('placeholder')).withContext('@ L\'input "' + HomePage.searchBlock.inputPlaceHolderValue + '" est affiché').toBe(HomePage.searchBlock.inputPlaceHolderValue)

    Logger.log('Le bouton "Rechercher" est clickable')
    expect(await HomePage.searchBlock.searchButton.isClickable()).withContext('@ Le bouton "Rechercher" est clickable').toBe(true)
  })

  // Bloc "Actualités"
  // -----------------
  it('Bloc "Actualités"', async () => {

    Logger.log('Le titre du bloc doit être "' + HomePage.newsBlock.titleValue + '"')
    expect(await HomePage.newsBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.newsBlock.titleValue + '"').toBe(true)
    expect(await HomePage.newsBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.newsBlock.titleValue + '"').toBe(HomePage.newsBlock.titleValue)
  })

  // Bloc "Tutoriels"
  // ----------------
  it('Bloc "Tutoriels"', async () => {

    Logger.log('Le titre du bloc doit être "' + HomePage.tutorialBlock.titleValue + '"')
    expect(await HomePage.tutorialBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.tutorialBlock.titleValue + '"').toBe(true)
    expect(await HomePage.tutorialBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.tutorialBlock.titleValue + '"').toBe(HomePage.tutorialBlock.titleValue)

    Logger.log('Le carousel est affiché')
    expect(await HomePage.tutorialBlock.carousel.isDisplayed()).withContext('@ Le carousel est affiché').toBe(true)
  })

  // Bloc "Mes cohortes favorites"
  // -----------------------------
  it('Bloc "Mes cohortes favorites"', async () => {

    Logger.log('Le titre du bloc doit être "' + HomePage.favoriteCohortsBlock.titleValue + '"')
    expect(await HomePage.favoriteCohortsBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.favoriteCohortsBlock.titleValue + '"').toBe(true)
    expect(await HomePage.favoriteCohortsBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.favoriteCohortsBlock.titleValue + '"').toBe(HomePage.favoriteCohortsBlock.titleValue)
   
    Logger.log('Le lien "' + HomePage.favoriteCohortsBlock.allCohortsLinkValue + '" est clickable')
    expect(await HomePage.favoriteCohortsBlock.allCohortsLink.isClickable()).withContext('@ Le lien "' + HomePage.favoriteCohortsBlock.allCohortsLinkValue + '" est clickable').toBe(true)

    if (await HomePage.favoriteCohortsBlock.table.isDisplayed()) {

      Logger.log('Les colonnes du tableau doivent être : ' + HomePage.favoriteCohortsBlock.tableHeaderValue.toUpperCase())
      expect(await HomePage.favoriteCohortsBlock.tableHeader()).withContext('@ Les colonnes du tableau doivent être : ' + HomePage.favoriteCohortsBlock.tableHeaderValue.toUpperCase()).toBe(HomePage.favoriteCohortsBlock.tableHeaderValue.toUpperCase())

      Logger.log('Test 1ère ligne : la ligne est clickable')
      expect(await HomePage.favoriteCohortsBlock.tableFirstLine.isClickable()).withContext('@ Test 1ère ligne : la ligne est clickable').toBe(true)

      Logger.log('Test 1ère ligne : le bouton "favoris" est clickable')
      expect(await HomePage.favoriteCohortsBlock.tableFirstLineFavoritesButton.isClickable()).withContext('@ Test 1ère ligne : le bouton "favoris" est clickable').toBe(true)

    } else {
    	Logger.log('Le tableau des cohortes favorites n\'est pas affiché, affichage du message "' + HomePage.favoriteCohortsBlock.noCohortMessageValue + '"')
    	expect(await HomePage.favoriteCohortsBlock.noCohortMessage.isDisplayed()).withContext('@ Le tableau des cohortes favorites n\'est pas affiché, affichage du message "' + HomePage.favoriteCohortsBlock.noCohortMessageValue + '"').toBe(true)
    	expect(await HomePage.favoriteCohortsBlock.noCohortMessage.getText()).withContext('@ Le tableau des cohortes favorites n\'est pas affiché, affichage du message "' + HomePage.favoriteCohortsBlock.noCohortMessageValue + '"').toBe(HomePage.favoriteCohortsBlock.noCohortMessageValue)
    }
  })

  // Bloc "Mes dernières cohortes créées"
  // ------------------------------------
  it('Bloc "Mes dernières cohortes créées"', async () => {

  	Logger.log('Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"')
  	expect(await HomePage.lastCreatedRequestsBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"').toBe(true)
  	expect(await HomePage.lastCreatedRequestsBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"').toBe(HomePage.lastCreatedRequestsBlock.titleValue)

  	Logger.log('Le lien "' + HomePage.lastCreatedRequestsBlock.allCohortsLinkValue + '" est clickable')
  	expect(await HomePage.lastCreatedCohortsBlock.allCohortsLink.isClickable()).withContext('@ Le lien "' + HomePage.lastCreatedCohortsBlock.allCohortsLinkValue + '" est clickable').toBe(true)

  	if (await HomePage.lastCreatedCohortsBlock.table.isDisplayed()) {
  		Logger.log('Les colonnes du tableau doivent être : ' + HomePage.lastCreatedCohortsBlock.tableHeaderValue.toUpperCase())
  		expect(await HomePage.lastCreatedCohortsBlock.tableHeader()).withContext('@ Les colonnes du tableau doivent être : ' + HomePage.lastCreatedCohortsBlock.tableHeaderValue.toUpperCase()).toBe(HomePage.lastCreatedCohortsBlock.tableHeaderValue.toUpperCase())

  		Logger.log('Test 1ère ligne : la ligne est clickable')
  		expect(await HomePage.lastCreatedCohortsBlock.tableFirstLine.isClickable()).withContext('@ Test 1ère ligne : la ligne est clickable').toBe(true)
      HomePage.lastCreatedCohortsBlock.tableFirstLine.click()
      browser.url(HomePage.getUrl())

  		Logger.log('Test 1ère ligne : le bouton "favoris" est clickable')
  		expect(await HomePage.lastCreatedCohortsBlock.tableFirstLineFavoritesButton.isClickable()).withContext('@ Test 1ère ligne : le bouton "favoris" est clickable').toBe(true)
  	} else {
  		Logger.log('Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedCohortsBlock.noCohortMessageValue + '"')
  		expect(await HomePage.lastCreatedCohortsBlock.noCohortMessage.isDisplayed()).withContext('@ Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedCohortsBlock.noCohortMessageValue + '"').toBe(true)
  		expect(await HomePage.lastCreatedCohortsBlock.noCohortMessage.getText()).withContext('@ Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedCohortsBlock.noCohortMessageValue + '"').toBe(HomePage.lastCreatedCohortsBlock.noCohortMessageValue)
  	}
  })

  // Bloc "Mes dernières requêtes créées"
  // ------------------------------------
  it('Bloc "Mes dernières requêtes créées"', async () => {

    Logger.log('Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"')
  	expect(await HomePage.lastCreatedRequestsBlock.title.isDisplayed()).withContext('@ Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"').toBe(true)
  	expect(await HomePage.lastCreatedRequestsBlock.title.getText()).withContext('@ Le titre du bloc doit être "' + HomePage.lastCreatedRequestsBlock.titleValue + '"').toBe(HomePage.lastCreatedRequestsBlock.titleValue)

    Logger.log('Le lien "' + HomePage.lastCreatedRequestsBlock.allRequestsLinkValue + '" est clickable')
  	expect(await HomePage.lastCreatedRequestsBlock.allRequestsLink.isClickable()).withContext('@ Le lien "' + HomePage.lastCreatedRequestsBlock.allCohortsLinkValue + '" est clickable').toBe(true)

  	if (await HomePage.lastCreatedRequestsBlock.table.isDisplayed()) {
  		Logger.log('Les colonnes du tableau doivent être : ' + HomePage.lastCreatedRequestsBlock.tableHeaderValue.toUpperCase())
  		expect(await HomePage.lastCreatedRequestsBlock.tableHeader()).withContext('@ Les colonnes du tableau doivent être : ' + HomePage.lastCreatedRequestsBlock.tableHeaderValue.toUpperCase()).toBe(HomePage.lastCreatedRequestsBlock.tableHeaderValue.toUpperCase())

  		Logger.log('Test 1ère ligne : la ligne est clickable')
  		expect(await HomePage.lastCreatedRequestsBlock.tableFirstLine.isClickable()).withContext('@ Test 1ère ligne : la ligne est clickable').toBe(true)
      HomePage.lastCreatedRequestsBlock.tableFirstLine.click()
      browser.url(HomePage.getUrl())

  		Logger.log('Test 1ère ligne : le bouton "edition" est clickable')
  		expect(await HomePage.lastCreatedRequestsBlock.tableFirstLineEditButton.isClickable()).withContext('@ Test 1ère ligne : le bouton "favoris" est clickable').toBe(true)
  	} else {
  		Logger.log('Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedRequestsBlock.noCohortMessageValue + '"')
  		expect(await HomePage.lastCreatedRequestsBlock.noCohortMessage.isDisplayed()).withContext('@ Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedRequestsBlock.noCohortMessageValue + '"').toBe(true)
  		expect(await HomePage.lastCreatedRequestsBlock.noCohortMessage.getText()).withContext('@ Le tableau des dernières cohortes crées n\'est pas affiché, affichage du message "' + HomePage.lastCreatedRequestsBlock.noCohortMessageValue + '"').toBe(HomePage.lastCreatedRequestsBlock.noCohortMessageValue)
  	}

  })

  // Déconnexion
  // -----------
  it('Déconnexion', async () => {
    Logger.log('Déconnexion')
    await HomePage.logout()
  })
})
