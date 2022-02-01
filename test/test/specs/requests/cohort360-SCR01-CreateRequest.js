const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const NewCohortPage = require('../../pageObjects/NewCohortPage')
const MyResearchProjectsPage = require('../../pageObjects/MyResearchProjectsPage')
const Logger = require('../../objects/Logger')

describe('Cohort360 - SCR01 - "Création d\'une requête"', () => {

    // Accès à la page "Nouvelle cohorte"
	// ----------------------------------
	it('Accès à la page "' + NewCohortPage.titleValue + '"', () => {
		NewCohortPage.login()

		Logger.log('L\'URL de la page "' + NewCohortPage.titleValue + '" doit être : ' + NewCohortPage.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "' + NewCohortPage.titleValue + '" doit être : ' + NewCohortPage.getUrl()).toBe(NewCohortPage.getUrl())

        Logger.log('La fenêtre modale "' + NewCohortPage.createRequestBox.titleValue + '" est affichée')
        expect(NewCohortPage.createRequestBox.box.waitForDisplayed()).withContext('@ La fenêtre modale "' + NewCohortPage.createRequestBox.titleValue + '" est affichée').toBe(true)

        /*Logger.log('Le titre de la fenêtre modale est : "' + NewCohortPage.requestCreateBox.titleValue + '"')
        expect(NewCohortPage.requestCreateBox.title.getText()).withContext('@ Le titre de la fenêtre modale est : "' + NewCohortPage.requestCreateBox.titleValue + '"').toBe(NewCohortPage.requestCreateBox.titleValue)*/

        Logger.log('L\'input "' + NewCohortPage.createRequestBox.requestNameInputLabel + '" est clickable')
		expect(NewCohortPage.createRequestBox.requestNameInput.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.createRequestBox.requestNameInputLabel + '" est clickable').toBe(true)

        Logger.log('L\'input "' + NewCohortPage.createRequestBox.projectSelectBoxLabel + '" est clickable')
		expect(NewCohortPage.createRequestBox.projectSelectBox.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.createRequestBox.projectSelectBoxLabel + '" est clickable').toBe(true)

        Logger.log('L\'input "' + NewCohortPage.createRequestBox.descriptionInputLabel + '" est clickable')
		expect(NewCohortPage.createRequestBox.descriptionInput.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.createRequestBox.descriptionInputLabel + '" est clickable').toBe(true)

        Logger.log('Le bouton "' + NewCohortPage.createRequestBox.cancelButtonValue + '" est clickable')
		expect(NewCohortPage.createRequestBox.cancelButton.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.createRequestBox.cancelButtonValue + '" est clickable').toBe(true)

		Logger.log('Le bouton "' + NewCohortPage.createRequestBox.createButtonValue + '" est clickable')
		expect(NewCohortPage.createRequestBox.createButton.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.createRequestBox.createButtonValue + '" est clickable').toBe(true)

	})

    // Création d'une nouvelle requête
	// -------------------------------
    var requestName = COHORT360_PARAMS.REQUEST_REQUEST_TEST_LIB + '_' + ((new Date().getHours() + 1) < 10 ? '0' + (new Date().getHours() + 1) : new Date().getHours() + 1) + ((new Date().getMinutes() + 1) < 10 ? '0' + (new Date().getMinutes() + 1) : new Date().getMinutes() + 1) + ((new Date().getSeconds() + 1) < 10 ? '0' + (new Date().getSeconds() + 1) : new Date().getSeconds() + 1)
	it('Création de la nouvelle requête "' + requestName + '"', () => {
        Logger.log('Nom de la requête : "' + requestName +'"')
		while (NewCohortPage.createRequestBox.requestNameInput.getValue().length != 0) {
			NewCohortPage.createRequestBox.requestNameInput.doubleClick()
			browser.keys("Delete")
		}
		NewCohortPage.createRequestBox.requestNameInput.setValue(requestName)

        Logger.log('Selection du projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"')
        NewCohortPage.createRequestBox.projectSelectBox.click()
        var projectName = null
        var newProject = null
        for (i=0; i<NewCohortPage.createRequestBox.projectSelectBoxListValue.length; i++) {
            if (NewCohortPage.createRequestBox.projectSelectBoxListValue[i].getText() == COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)
                projectName = NewCohortPage.createRequestBox.projectSelectBoxListValue[i]
            if (NewCohortPage.createRequestBox.projectSelectBoxListValue[i].getText() == NewCohortPage.createRequestBox.newProjectLabel)
                newProject = NewCohortPage.createRequestBox.projectSelectBoxListValue[i]          
        }

        if (projectName != null)
            projectName.click()
        else {
            Logger.log('Le projet : "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '" n\'existe pas')
            newProject.click()
            NewCohortPage.createRequestBox.newProjectNameInput.waitForClickable()
            Logger.log('Création du projet du projet "' + COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB + '"')
            NewCohortPage.createRequestBox.newProjectNameInput.moveTo()
		    while (NewCohortPage.createRequestBox.newProjectNameInput.getValue().length != 0) {
                NewCohortPage.createRequestBox.newProjectNameInput.doubleClick()
                browser.keys("Delete")
            }
            NewCohortPage.createRequestBox.newProjectNameInput.setValue(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)
        }

        Logger.log('Description de la requête : ')
		while (NewCohortPage.createRequestBox.descriptionInput.getValue().length != 0) {
			NewCohortPage.createRequestBox.descriptionInput.doubleClick()
			browser.keys("Delete")
		}
		NewCohortPage.createRequestBox.descriptionInput.setValue('Requête de test Sélénium')

        Logger.log('Création de la requête : "' + requestName +'" (click sur "' + NewCohortPage.createRequestBox.createButtonValue + '")')
		NewCohortPage.createRequestBox.createButton.click()
    })

    // Vérification de la création de la requête
    // -----------------------------------------
    it('Vérification de la création de la nouvelle requête "' + requestName + '"', () => {
        Logger.log('Ouverture de la page "' + MyResearchProjectsPage.titleValue + '"')
        MyResearchProjectsPage.open()
		MyResearchProjectsPage.projectListBlock.resetList()

        Logger.log('La requête "' + requestName +'" est bien créée')
		var isRequestCreated = false
        if (MyResearchProjectsPage.projectListBlock.getProjectByName(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB) == true) {         
            if (MyResearchProjectsPage.projectListBlock.currentProjectRequestList.getRequestByName(requestName) == true) {
                MyResearchProjectsPage.projectListBlock.currentProject.scrollIntoView()
                isRequestCreated = true
            }
        }
		expect(isRequestCreated).withContext('@ La requête "' + requestName +'" est bien créée').toBe(true)
    })

    // Retour sur la page de création de requête
    // -----------------------------------------
    it('Retour sur la page "' + NewCohortPage.titleValue + '" pour construction de la requête "' + requestName + '"', () => {
        Logger.log('Click sur le titre de la requête "' + requestName + '"')
        MyResearchProjectsPage.projectListBlock.currentProjectRequestList.currentRequestTitle.click()

        Logger.log('L\'URL de la page "' + NewCohortPage.titleValue + '" doit être : ' + NewCohortPage.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "' + NewCohortPage.titleValue + '" doit être : ' + NewCohortPage.getUrl()).toBe(NewCohortPage.getUrl())

        Logger.log('Le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '" est clickable')
		expect(NewCohortPage.sourcePopulationChoiceButton.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '" est clickable').toBe(true)
    })

    // Choix de la / des structure(s) hospitalière(s)
	// ----------------------------------------------
	it('Choix de la / des structure(s) hospitalière(s)', () => {
        Logger.log('Click sur le bouton "' + NewCohortPage.sourcePopulationChoiceButtonValue + '"')
        NewCohortPage.sourcePopulationChoiceButton.click()
        
        Logger.log('Le bloc "' + NewCohortPage.hospitalStructureListBlock.titleValue + '" est affiché')
		expect(NewCohortPage.hospitalStructureListBlock.block.waitForDisplayed()).withContext('@ Le bloc "' + NewCohortPage.hospitalStructureListBlock.titleValue + '" est affiché').toBe(true)

        NewCohortPage.hospitalStructureListBlock.resetList()
        var linesToCheck = NewCohortPage.hospitalStructureListBlock.linesToCheck
        
        for (var i=0; i<linesToCheck.length; i++) {
            var lLineNumber = linesToCheck[i]
            NewCohortPage.hospitalStructureListBlock.setCurrentLine(lLineNumber)

            Logger.log('Sélection de : ' + NewCohortPage.hospitalStructureListBlock.currentLineName.getText())
            NewCohortPage.hospitalStructureListBlock.currentLine.scrollIntoView()
            NewCohortPage.hospitalStructureListBlock.currentLineCheckBox.click()
            NewCohortPage.hospitalStructureListBlock.currentLine.scrollIntoView()
            expect(NewCohortPage.hospitalStructureListBlock.currentLineCheckBox.getAttribute('checked')).withContext('@ Sélection de : ' + NewCohortPage.hospitalStructureListBlock.currentLineName.getText()).not.toBe(null)
            
            NewCohortPage.hospitalStructureListBlock.resetList()
        }

        Logger.log('Le bouton "' + NewCohortPage.hospitalStructureListBlock.confirmButtonValue + '" est clickable')
		expect(NewCohortPage.hospitalStructureListBlock.confirmButton.waitForClickable()).withContext('@ Le bouton "' + NewCohortPage.hospitalStructureListBlock.confirmButtonValue + '" est clickable').toBe(true)

        Logger.log('Confirmation de la sélection (click sur le bouton "' + NewCohortPage.hospitalStructureListBlock.confirmButtonValue + '")')
        NewCohortPage.hospitalStructureListBlock.confirmButton.click()    

        Logger.log('Le bloc "Population source" est affiché')
		expect(NewCohortPage.sourcePopulationBlock.waitForDisplayed()).withContext('@ Le bloc "Population source" est affiché').toBe(true)

        Logger.log(NewCohortPage.counterLibValue + ' : ' + NewCohortPage.counter.getText())
        expect(NewCohortPage.counter.getText()).withContext('@ ' + NewCohortPage.counterLibValue + ' : ' + NewCohortPage.counter.getText()).not.toBe(NewCohortPage.counterDefaultValue)
    })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		NewCohortPage.logout()
	})

})