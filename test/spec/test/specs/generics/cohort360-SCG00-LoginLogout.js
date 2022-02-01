const LoginPage = require('../../pageObjects/LoginPage')
const HomePage = require('../../pageObjects/HomePage')
const LoginLogout = require('../../objects/LoginLogout')
const Logger = require('../../objects/Logger')
const COHORT360_PARAMS = require('../../params/cohort360-param')

describe('Cohort360 - SC00 - Connexion / Déconnexion', () => {
	 
	//  Accès à la page d'authentification & vérification de la présence du formulaire d'authentification
	//  -------------------------------------------------------------------------------------------------
	it('Accès à la page d\'authentification', async () => {
		
		console.log(`COHORT360_PARAMS.URL`, COHORT360_PARAMS.URL)
		console.log(`COHORT360_PARAMS.LOGIN`, COHORT360_PARAMS.LOGIN)
		console.log(`COHORT360_PARAMS.PASSWORD`, COHORT360_PARAMS.PASSWORD)
		
		await LoginPage.open()
		
		Logger.log('L\'URL de la page d\'authentification doit être : ' + LoginPage.getUrl())
		expect(await browser.getUrl()).withContext('@ L\'URL de la page d\'authentification doit être : ' + LoginPage.getUrl()).toBe(LoginPage.getUrl())
				
		Logger.log('Vérification de la présence du formulaire d\'authentification')	
		expect(await LoginPage.loginField.isDisplayed() && await LoginPage.passwordField.isDisplayed()).withContext('@ Affichage des input "Identifiant" & "Votre mot de passe" du formulaire').toBe(true)
    })
	
	//  Vérification de la présence du lien vers la mention légale
	//  ----------------------------------------------------------
	it('Le lien vers la mention légale est présent', async () => {

		Logger.log('Le lien est affiché')
		expect(await LoginPage.legalNoticeBlock.link.isDisplayed()).withContext('@ Le lien est affiché').toBe(true)
		
		Logger.log('Le lien est clickable')
		expect(await LoginPage.legalNoticeBlock.link.isClickable()).withContext('@ Le lien est clickable').toBe(true)
	})
	
	//  Vérification de l'affichage et du texte de la mention légale
	//  ------------------------------------------------------------
	it('Affichage et vérification du texte de la mention légale', async () => {

		Logger.log('Click sur le lien')
		await LoginPage.legalNoticeBlock.link.click()
		
		Logger.log('Affichage de la fenêtre modale')
		expect(await LoginPage.modalBox.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale').toBe(true)

		Logger.log('Affichage du contenu de la mention légale')
		expect(await LoginPage.modalBox.boxContent.isDisplayed()).withContext('@ Affichage du contenu de la mention légale').toBe(true)
		expect(await LoginPage.modalBox.boxContent.$$('p')[0].getText()).withContext("@ Mention légale P1").toBe(LoginPage.legalNoticeBlock.p1Value)
		expect(await LoginPage.modalBox.boxContent.$$('p')[1].getText()).withContext("@ Mention légale P2").toBe(LoginPage.legalNoticeBlock.p2Value)
		expect(await LoginPage.modalBox.boxContent.$$('p')[2].getText()).withContext("@ Mention légale P3").toBe(LoginPage.legalNoticeBlock.p3Value)

		Logger.log('Le bouton de fermeture est clickable')
		var OkButton = await LoginPage.modalBox.okButton
		expect(await OkButton.isClickable()).withContext('@ Le bouton de fermeture est clickable').toBe(true)
		
		Logger.log('Fermeture')
		await OkButton.click()
	})
	
	// Saisie de login/pwd incorrects et soumission du formulaire
	// ----------------------------------------------------------
	it('Saisie login/pwd incorrects et connexion', async () => {

		LoginPage.login('aaaaaaaaaa', 'aaaaaaaaaa')

		Logger.log('Affichage de la fenêtre modale')
		expect(await LoginPage.modalBox.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale').toBe(true)
		
		Logger.log('Le message d\'erreur est présent')
		expect(await LoginPage.invalidCredentialsErrorMessage.isDisplayed()).withContext('@ Le message d\'erreur est présent').toBe(true)
		
		Logger.log('Le bouton OK est clickable')
		expect(await LoginPage.modalBox.okButton.isClickable()).withContext('@ Le bouton OK est clickable').toBe(true)

		Logger.log('Fermeture du message d\'erreur')
		await LoginPage.modalBox.okButton.click()
    })

	// Saisie de login/pwd et soumission du formulaire
	// -----------------------------------------------
	it('Saisie login/pwd et connexion', async () => {

		await HomePage.login()

		Logger.log('Le message de bienvenue est affiché')
		expect(await HomePage.welcomeMessage.waitForDisplayed()).withContext('@ Le message de bienvenue est affiché').toBe(true)

		Logger.log('L\'URL de la page d\'accueil doit être : ' + HomePage.getUrl())
		expect(await browser.getUrl()).withContext('@ L\'URL de la page d\'accueil doit être : ' + HomePage.getUrl()).toBe(HomePage.getUrl())
    })
	
	//  Déconnexion
	//  -----------
	it('Déconnexion', async () => {

		Logger.log('Déconnexion')
		await HomePage.logout()
		console.log(`HomePage.logout()`, await HomePage.logout())

		Logger.log('L\'URL de la page d\'authentification doit être : ' + LoginPage.getUrl())
		expect(await browser.getUrl()).withContext('@ L\'URL de la page d\'authentification doit être : ' + LoginPage.getUrl()).toBe(LoginPage.getUrl())

		Logger.log('Vérification de la présence du formulaire d\'authentification')	
		expect(await LoginPage.loginField.isDisplayed() && await LoginPage.passwordField.isDisplayed()).withContext('@ Affichage des input "Identifiant" & "Votre mot de passe" du formulaire').toBe(true)
	})	
})
