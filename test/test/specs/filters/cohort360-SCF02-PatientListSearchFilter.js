const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const SearchPatientPage = require('../../pageObjects/SearchPatientPage')
const Logger = require('../../objects/Logger')
const PatientDetailPage = require('../../pageObjects/PatientDetailPage')

const Page = SearchPatientPage
const PatientList = Page.patientListBlock

var searchValueList = []
if (COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length == 1 && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][0] == 'IPP' && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][1] == '') {
    searchValueList[0] = [ COHORT360_PARAMS.PATIENT_SEARCH_ALL_LIB, 'martin' ]
    searchValueList[1] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0]
}
else if (COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length > 1 && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][0] == 'IPP' && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][1] == '') {
    for (var i=0; i<COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length -1; i++) {
        searchValueList[i] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[i+1]
    }
    searchValueList[COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length-1] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0]
}
else {
    searchValueList = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST 
}

describe('Cohort360 - SCF02 - Filtre "Rechercher un patient"', () => {
	 
	// Accès à la page "Rechercher un patient"
	// ---------------------------------------
	it('Accès à la page "Rechercher un patient" (authentification)', () => {
        Logger.log('Accès à la page "' + Page.titleValue + '"')
        Page.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

        Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
        expect(Page.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + Page.titleValue + '"').toBe(true)
	})

    // Filtre "Rechercher un patient"
    // ------------------------------
    it('Filtre "Rechercher un patient"', () => {
        Logger.log('Le bouton "Rechercher" est clickable')
        expect(PatientList.searchFilter.searchButton.isClickable()).withContext('@ Le bouton "Rechercher" est clickable').toBe(true)

        Logger.log('L\'input text a comme valeur "' + PatientList.searchFilter.inputPlaceHolderValue + '"')
        expect(PatientList.searchFilter.input.getProperty('placeholder')).withContext('@ L\'input text a comme valeur "' + PatientList.searchFilter.inputPlaceHolderValue + '"').toBe(PatientList.searchFilter.inputPlaceHolderValue)

        Logger.log('Saisie de : "' + PatientList.searchFilter.searchValueList[0] + '" => Le bouton "clear" est clickable')
        PatientList.searchFilter.input.setValue(PatientList.searchFilter.searchValueList[0])
        expect(PatientList.searchFilter.clearButton.isClickable()).withContext('@ Saisie de : "' + PatientList.searchFilter.searchValueList[0] + '" => Le bouton "clear" est clickable').toBe(true)

        Logger.log('Effacer la saisie => click sur le bouton "clear"')
        PatientList.searchFilter.clearButton.click()
        expect(PatientList.searchFilter.input.getValue()).withContext('@ Effacer la saisie => click sur le bouton "clear"').toBe('')

        Logger.log('Le bouton de sélection du champ de recherche est clickable')
        expect(PatientList.searchFilter.selectButton.isClickable()).withContext('@ Le bouton de sélection du champ de recherche est clickable').toBe(true)
    })

    // Lancer une/des recherche(s)
    // ---------------------------
    searchValueList.forEach((searchValue) => {  
        it('Recherche sur "' + searchValue[0] + '"', () => {    
            if (PatientList.searchFilter.clearButton.waitForClickable()) {
                Logger.log('Effacer la saisie => click sur le bouton "clear"')
                PatientList.searchFilter.clearButton.click()
                expect(PatientList.searchFilter.input.getValue()).withContext('@ Effacer la saisie => click sur le bouton "clear"').toBe('')
            }

            Logger.log('Recherche sur "' + searchValue[0] + ' / ' + searchValue[1] + '"')
            PatientList.searchFilter.selectButton.waitForClickable()
            PatientList.searchFilter.selectButton.click()
            PatientList.searchFilter.getSelectedItem(searchValue[0]).click()
            expect(PatientList.searchFilter.selectedValue.getText()).withContext('@ Recherche sur "' + searchValue[0] + ' / ' + searchValue[1] + '"').toBe(searchValue[0])
            
            PatientList.searchFilter.input.setValue(searchValue[1])
            PatientList.searchFilter.searchButton.waitForClickable()
            PatientList.searchFilter.searchButton.click()
            expect(PatientList.searchFilter.input.getValue()).withContext('@ Recherche sur "' + searchValue[0] + ' / ' + searchValue[1] + '"').toBe(searchValue[1])

            PatientList.resetList()
            var linesToCheck = PatientList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée')
                PatientList.setCurrentLine(lLineNumber)
                PatientList.currentLine.scrollIntoView()
                expect(PatientList.currentLine.waitForDisplayed()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - La ligne de la liste de documents est affichée').toBe(true)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.currentLineDisplayed)

                if (searchValueList[searchValueList.findIndex(obj => obj[0] === 'IPP')][1] == '')
                    searchValueList[searchValueList.findIndex(obj => obj[0] === 'IPP')][1] = PatientList.currentLinePatientTechIdOrIPP.getText()

                if (PatientList.searchFilter.selectedValue.getText() == PatientList.searchFilter.selectBoxFirstNameLib) {
                    Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerFirstNameValue + ' contient "' + searchValue[1] + '"')
                    expect((PatientList.currentLineFirstName.getText()).toUpperCase()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerFirstNameValue + ' contient "' + searchValue[1] + '"').toContain(searchValue[1].toUpperCase())
                }
                else if (PatientList.searchFilter.selectedValue.getText() == PatientList.searchFilter.selectBoxLastNameLib) {
                    Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerLastNameValue + ' contient "' + searchValue[1] + '"')
                    expect((PatientList.currentLineLastName.getText()).toUpperCase()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerLastNameValue + ' contient "' + searchValue[1] + '"').toContain(searchValue[1].toUpperCase())
                }
                else if (PatientList.searchFilter.selectedValue.getText() == PatientList.searchFilter.selectBoxIPPLib) {
                    Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerPatientIPPValue + ' contient "' + searchValue[1] + '"')
                    expect((PatientList.currentLinePatientTechIdOrIPP.getText()).toUpperCase()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerPatientIPPValue + ' contient "' + searchValue[1] + '"').toContain(searchValue[1].toUpperCase())
                }
                else {
                    Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerFirstNameValue + ' ou ' + PatientList.headerLastNameValue + ' ou ' + PatientList.headerPatientIPPValue + ' contient "' + searchValue[1] + '"')
                    expect((PatientList.currentLineFirstName.getText() + PatientList.currentLineLastName.getText() + PatientList.currentLinePatientTechIdOrIPP.getText()).toUpperCase()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.headerFirstNameValue + ' ou ' + PatientList.headerLastNameValue + ' ou ' + PatientList.headerPatientIPPValue + ' contient "' + searchValue[1] + '"').toContain(searchValue[1].toUpperCase())
                }

                /*const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		        Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Click sur la ligne => Accès à la page "Détail patient"')
		        PatientList.currentLine.click()
                var urlRegEx = new RegExp(PatientDetailPage.getUrl().replace(/\//g, "\\/").replace(/\./g, "\\.") + "\\/\\d+\\?") 
                browser.switchWindow(urlRegEx)
		        expect(browser.getUrl()).toContain(PatientDetailPage.getUrl(), '@ L\'URL de la page "Détail patient" doit être : ' + PatientDetailPage.getUrl())

		        Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		        expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext().toBe(true, '@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		        expect(PatientDetailPage.patientTechIdOrIPP.getText()).toContain(patientTechIdOrIPP, '@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)

                Logger.log('Retour sur la page "' + Page.titleValue + '"')
                browser.closeWindow()
                browser.switchWindow(Page.getUrl())
                expect(browser.getUrl()).withContext().toBe(Page.getUrl(), '@ L\'URL de la page "Données patient" doit être : ' + Page.getUrl())
        
                Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
                expect(Page.title.waitForDisplayed()).withContext().toBe(true, '@ Le titre de la page est : "' + Page.titleValue + '"')*/
            }

            /*Logger.log('Effacer la saisie => click sur le bouton "clear"')
            PatientList.searchFilter.clearButton.click()
            expect(PatientList.searchFilter.input.getValue()).withContext().toBe('', '@ Effacer la saisie => click sur le bouton "clear"')*/
        })
    })

    // Accès à la page "Détail patient"
	// --------------------------------
	it('Accès à la page "Détail patient"', () => {
        // PatientList.setCurrentLine(0)
		const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		Logger.log('Click sur la 1ère ligne : accès à la page "Détail patient"')
		PatientList.currentLine.click()

        // var windows = browser.getWindowHandles()
        // for (var i=0; i<windows.length; i++) {
        //    browser.switchToWindow(windows[i])
        //    if (browser.getUrl().indexOf(PatientDetailPage.getUrl()) != -1)
        //        break
        // }
        var urlRegEx = new RegExp(PatientDetailPage.getUrl().replace(/\//g, "\\/").replace(/\./g, "\\.") + "\\/\\d+\\?") 
        browser.switchWindow(urlRegEx)
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Détail patient" doit être : ' + PatientDetailPage.getUrl()).toContain(PatientDetailPage.getUrl())

		Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toBe(true)
		expect(PatientDetailPage.patientTechIdOrIPP.getText()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toContain(patientTechIdOrIPP)
	})

	// Retour sur la page "Rechercher un patient"
	// ------------------------------------------
	it('Retour sur la page "Rechercher un patient"', () => {
        Logger.log('Accès à la page "' + Page.titleValue + '"')
		browser.closeWindow()
		browser.switchWindow(Page.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Rechercher un patient" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

        Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
        expect(Page.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + Page.titleValue + '"').toBe(true)		
	})

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})
	
})