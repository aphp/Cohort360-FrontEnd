const COHORT360_PARAMS = require('../../params/cohort360-param.js')
const Logger = require('../../objects/Logger')
const PatientContextBar = require('../../objects/PatientContextBar')
const MyPatientDatasPage = require('../../pageObjects/MyPatientDatasPage')
const PatientDetailPage = require('../../pageObjects/PatientDetailPage')

/*const args = process.argv.slice(1)
const path = args[1]*/

const Page = MyPatientDatasPage
const PatientList = Page.patientListBlock

describe('Cohort360 - SCF01 - Filtre "Liste patients"', () => {

    // Accès à la page "Données patient"
	// ---------------------------------
	// it('Accès à la page "' + PatientContextBar.title + '" > onglet "' + Page.patientsTab.getText() + '" (authentification)', () => {
    it('Accès à la page "Tous mes patients" > onglet "Patients" (authentification)', () => {
        // Logger.log('Accès à la page "' + PatientContextBar.title + '" > onglet "' + Page.patientsTab.getText() + '"')
        Logger.log('Accès à la page "Tous mes patients" > onglet "Patients"')
        Page.login()
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Tous mes patients" > onglet "Patients" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

		Logger.log(PatientContextBar.accessLibValue + ' ' + Page.access)
		expect(Page.access).withContext('@ ' + PatientContextBar.accessLibValue + ' ' + Page.access).not.toBe(PatientContextBar.defaultAccessValue)

		Logger.log('L\'onglet "' + Page.patientsTab.getText() + '" est actif')
        expect(Page.patientsTab.getAttribute('aria-selected')).withContext('@ L\'onglet "' + Page.patientsTab.getText() + '" est actif').toBe('true')
        
        Logger.log('La 1ère ligne de la liste de patients est affichée')
        PatientList.resetList()
        PatientList.setCurrentLine(0)
        expect(PatientList.currentLine.waitForDisplayed()).withContext('@ La 1ère ligne de la lise de documents est affichée').toBe(true)
        Logger.log(PatientList.currentLineDisplayed)
    })
    
    // Accès au filtre
    // ---------------
    it('Accès au filtre', () => {
        Logger.log('Le bouton "' + PatientList.filterButtonValue + '" est clickable')
		expect(PatientList.filterButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filterButtonValue + '" est clickable').toBe(true)
        
        Logger.log('Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"')
        PatientList.filterButton.click()
        expect(PatientList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"').toBe(true)
        
        Logger.log('Le titre de la fenêtre modale doit être : ' + PatientList.filter.titleValue)
        expect(PatientList.filter.title.getText()).withContext('@ Le titre de la fenêtre modale doit être : ' + PatientList.filter.titleValue).toBe(PatientList.filter.titleValue)

        const blocks = PatientList.filter.genderFilterBlock.titleValue + ' | ' + PatientList.filter.ageFilterBlock.titleValue + ' | ' + PatientList.filter.vitalStatusFilterBlock.titleValue
        Logger.log('Affichage de 3 blocs de filtre : ' + blocks)
        expect(PatientList.filter.genderFilterBlock.title.getText()).withContext('@ Affichage de 3 blocs de filtre : ' + blocks).toBe(PatientList.filter.genderFilterBlock.titleValue)
        expect(PatientList.filter.ageFilterBlock.title.getText()).withContext('@ Affichage de 3 blocs de filtre : ' + blocks).toBe(PatientList.filter.ageFilterBlock.titleValue)
        expect(PatientList.filter.vitalStatusFilterBlock.title.getText()).withContext('@ Affichage de 3 blocs de filtre : ' + blocks).toBe(PatientList.filter.vitalStatusFilterBlock.titleValue)

        const genderLabelsValue = PatientList.filter.genderFilterBlock.maleLabelValue + ' | ' + PatientList.filter.genderFilterBlock.femaleLabelValue + ' | ' + PatientList.filter.genderFilterBlock.otherLabelValue + ' | ' + PatientList.filter.genderFilterBlock.allLabelValue
        Logger.log('Les choix possible pour le filtre "' + PatientList.filter.genderFilterBlock.titleValue + '" : ' + genderLabelsValue)
        expect(PatientList.filter.genderFilterBlock.maleLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.genderFilterBlock.titleValue + '" : ' + genderLabelsValue).toBe(PatientList.filter.genderFilterBlock.maleLabelValue)
        expect(PatientList.filter.genderFilterBlock.femaleLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.genderFilterBlock.titleValue + '" : ' + genderLabelsValue).toBe(PatientList.filter.genderFilterBlock.femaleLabelValue)
        expect(PatientList.filter.genderFilterBlock.otherLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.genderFilterBlock.titleValue + '" : ' + genderLabelsValue).toBe(PatientList.filter.genderFilterBlock.otherLabelValue)
        expect(PatientList.filter.genderFilterBlock.allLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.genderFilterBlock.titleValue + '" : ' + genderLabelsValue).toBe(PatientList.filter.genderFilterBlock.allLabelValue)
        
        Logger.log('"' + PatientList.filter.genderFilterBlock.allLabelValue + '" est sélectionné par défaut')
        expect(PatientList.filter.genderFilterBlock.isSelected(PatientList.filter.genderFilterBlock.allItem)).withContext('@ "' + PatientList.filter.genderFilterBlock.allLabelValue + '" est sélectionné par défaut').toBe(true)

        Logger.log('Affichage de la "timeline" pour le filtre "' + PatientList.filter.ageFilterBlock.titleValue + '"')
        expect(PatientList.filter.ageFilterBlock.sliderLine.isDisplayed()).withContext('@ Affichage de la "timeline" pour le filtre "' + PatientList.filter.ageFilterBlock.titleValue + '"').toBe(true)

        Logger.log('Intervalle sélectionné par défaut : ' + PatientList.filter.ageFilterBlock.interval.getValue())

        const vitaStatusLabelsValue = PatientList.filter.vitalStatusFilterBlock.aliveLabelValue + ' | ' + PatientList.filter.vitalStatusFilterBlock.deadLabelValue + ' | ' + PatientList.filter.vitalStatusFilterBlock.allLabelValue
        Logger.log('Les choix possible pour le filtre "' + PatientList.filter.vitalStatusFilterBlock.titleValue + '" : ' + vitaStatusLabelsValue)
        expect(PatientList.filter.vitalStatusFilterBlock.aliveLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.vitalStatusFilterBlock.titleValue + '" : ' + vitaStatusLabelsValue).toBe(PatientList.filter.vitalStatusFilterBlock.aliveLabelValue)
        expect(PatientList.filter.vitalStatusFilterBlock.deadLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.vitalStatusFilterBlock.titleValue + '" : ' + vitaStatusLabelsValue).toBe(PatientList.filter.vitalStatusFilterBlock.deadLabelValue)
        expect(PatientList.filter.vitalStatusFilterBlock.allLabel.getText()).withContext('@ Les choix possible pour le filtre "' + PatientList.filter.vitalStatusFilterBlock.titleValue + '" : ' + vitaStatusLabelsValue).toBe(PatientList.filter.vitalStatusFilterBlock.allLabelValue)

        Logger.log('"' + PatientList.filter.vitalStatusFilterBlock.allLabelValue + '" est sélectionné par défaut')
        expect(PatientList.filter.vitalStatusFilterBlock.isSelected(PatientList.filter.vitalStatusFilterBlock.allItem)).withContext('@ "' + PatientList.filter.vitalStatusFilterBlock.allLabelValue + '" est sélectionné par défaut').toBe(true)
    })

    // Annuler le filtre
    // -----------------
    it('Annuler le filtre', () => {
        Logger.log('Le bouton "' + PatientList.filter.cancelButtonValue + '" est clickable')
        expect(PatientList.filter.cancelButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filter.cancelButtonValue + '" est clickable').toBe(true)

        Logger.log('Annuler le filtre => Fermeture de la fenêtre modale "' + PatientList.filter.titleValue + '"')
        PatientList.filter.cancelButton.click()
        Logger.log('Le bouton "' + PatientList.filterButtonValue + '" est clickable')
		expect(PatientList.filterButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filterButtonValue + '" est clickable').toBe(true)
    })

    // Filtrer par genre
    // -----------------
    COHORT360_PARAMS.PATIENT_GENDER_FILTER_LIST.forEach((genderValue) => {
        it('Filtrer par genre : "' + genderValue + '"', () => {
            Logger.log('Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filterButton.click()
            expect(PatientList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"').toBe(true)

            Logger.log('Choix de l\'item "' + genderValue + '"')
            PatientList.filter.genderFilterBlock.getSelectedItem(genderValue).click()

            Logger.log('Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable')
            expect(PatientList.filter.validateButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filter.validateButton.click()
            Logger.log('Le bouton "' + PatientList.filterButtonValue + '" est clickable')
            expect(PatientList.filterButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filterButtonValue + '" est clickable').toBe(true)

            if (genderValue != PatientList.filter.genderFilterBlock.allLabelValue) {
                Logger.log('Le bouton du filtre "Genre" est affiché')
                expect(PatientList.selectedFilters.isGenderFilterSelected()).withContext('@ Le bouton du filtre "Genre" est affiché').toBe(true)
            }

            PatientList.resetList()
            var linesToCheck = PatientList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                PatientList.setCurrentLine(lLineNumber)
                PatientList.currentLine.scrollIntoView()
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.currentLineDisplayed)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - "' + PatientList.headerGenderValue.toUpperCase() + '" doit être "' + genderValue + '"')
                if (genderValue != PatientList.filter.genderFilterBlock.allLabelValue) {
                    expect(PatientList.getCurrentLineGender()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - "' + PatientList.headerGenderValue.toUpperCase() + '" doit être "' + genderValue + '"').toBe(genderValue)
                }    

                /*const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		        Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Click sur la ligne => Accès à la page "Détail patient"')
		        PatientList.currentLine.click()
                browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
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

            Logger.log('Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText())
		    expect(PatientList.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText()).toBe(true)
        })
    })

    // Filtrer par âge
    // ---------------
    COHORT360_PARAMS.PATIENT_AGE_FILTER_LIST.forEach((ageValue) => {
        it('Filtrer par âge : "' + ageValue[0] + ' ans - ' + ageValue[1] + ' ans"', () => {
            Logger.log('Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filterButton.click()
            expect(PatientList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"').toBe(true)

            Logger.log('Choix de l\'intervalle ' + ageValue[0] + '-' + ageValue[1] + ' ans')
            PatientList.filter.ageFilterBlock.resetAgeInterval()
            PatientList.filter.ageFilterBlock.setAgeMin(ageValue[0])
            PatientList.filter.ageFilterBlock.setAgeMax(ageValue[1])
        
            Logger.log('Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable')
            expect(PatientList.filter.validateButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filter.validateButton.click()
            Logger.log('Le bouton "' + PatientList.filterButtonValue + '" est clickable')
            expect(PatientList.filterButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filterButtonValue + '" est clickable').toBe(true)

            Logger.log('Le bouton du filtre "Âge" est affiché')
            expect(PatientList.selectedFilters.isAgeFilterSelected()).withContext('@ Le bouton du filtre "Âge" est affiché').toBe(true)

            PatientList.resetList()
            var linesToCheck = PatientList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                PatientList.setCurrentLine(lLineNumber)
                PatientList.currentLine.scrollIntoView()
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.currentLineDisplayed) 
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Age du patient : ' + PatientList.getCurrentLineAgeDigit() + ' an(s) doit être compris entre ' + ageValue[0] + ' an(s) et ' + ageValue[1] + ' an(s)')
                expect(PatientList.getCurrentLineAgeDigit() <= ageValue[1] && PatientList.getCurrentLineAgeDigit() >= ageValue[0]).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - Age du patient : ' + PatientList.getCurrentLineAgeDigit() + ' an(s) doit être compris entre ' + ageValue[0] + ' an(s) et ' + ageValue[1] + ' an(s)').toBe(true)

                /*const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		        Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Click sur la ligne => Accès à la page "Détail patient"')
		        PatientList.currentLine.click()
                browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
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

            Logger.log('Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText())
            expect(PatientList.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText()).toBe(true)
        })
    })

    // Filtrer par statut vital
    // ------------------------
    COHORT360_PARAMS.PATIENT_VITAL_STATUS_FILTER_LIST.forEach((vitalStatusValue) => {
        it('Filtrer par statut vital : "' + vitalStatusValue + '"', () => {
            Logger.log('Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filterButton.click()
            expect(PatientList.filter.box.waitForDisplayed()).withContext('@ Affichage de la fenêtre modale "' + PatientList.filter.titleValue + '"').toBe(true)

            Logger.log('Choix de l\'item "' + vitalStatusValue + '"')
            PatientList.filter.vitalStatusFilterBlock.getSelectedItem(vitalStatusValue).click()

            Logger.log('Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable')
            expect(PatientList.filter.validateButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filter.validateButtonValue + '" est clickable').toBe(true)

            Logger.log('Valider le filtre => Fermeture de la fenêtre modale "' + PatientList.filter.titleValue + '"')
            PatientList.filter.validateButton.click()
            Logger.log('Le bouton "' + PatientList.filterButtonValue + '" est clickable')
            expect(PatientList.filterButton.waitForClickable()).withContext('@ Le bouton "' + PatientList.filterButtonValue + '" est clickable').toBe(true)

            if (vitalStatusValue != PatientList.filter.vitalStatusFilterBlock.allLabelValue) {
                Logger.log('Le bouton du filtre "Statut vital" est affiché')
                expect(PatientList.selectedFilters.isVitalStatusFilterSelected()).withContext('@ Le bouton du filtre "Statut vital" est affiché').toBe(true)
            }

            PatientList.resetList()
            var linesToCheck = PatientList.linesToCheck
            for (var j=0; j<linesToCheck.length; j++) {
                var lLineNumber = linesToCheck[j]
                var vitalStatus = 'Tous'
                if (vitalStatusValue == PatientList.filter.vitalStatusFilterBlock.aliveLabelValue) {
                    vitalStatus = PatientList.aliveVitalStatusValue
                } 
                else if (vitalStatusValue == PatientList.filter.vitalStatusFilterBlock.deadLabelValue) {
                    vitalStatus = PatientList.deadVitalStatusValue
                }
            
                PatientList.setCurrentLine(lLineNumber)
                PatientList.currentLine.scrollIntoView()
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - ' + PatientList.currentLineDisplayed)
                Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - "' + PatientList.headerVitalStatusValue.toUpperCase() + '" doit être "' + vitalStatus + '"')
                if (vitalStatusValue != PatientList.filter.vitalStatusFilterBlock.allLabelValue) {
                    expect(PatientList.currentLineVitalStatus.getText()).withContext('@ Ligne n° ' + (lLineNumber + 1 ) + ' - "' + PatientList.headerVitalStatusValue.toUpperCase() + '" doit être "' + vitalStatus + '"').toBe(vitalStatus)
                }

                /*const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		        Logger.log('Ligne n° ' + (lLineNumber + 1 ) + ' - Click sur la ligne => Accès à la page "Détail patient"')
		        PatientList.currentLine.click()
                browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
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

            Logger.log('Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText())
		    expect(PatientList.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText()).toBe(true)           
        })
    })

    // Accès à la page "Détail patient"
	// --------------------------------
	it('Accès à la page "Détail patient"', () => {
        // PatientList.setCurrentLine(0)
		const patientTechIdOrIPP = PatientList.currentLinePatientTechIdOrIPP.getText()

		Logger.log('Click sur la ligne courante : accès à la page "Détail patient"')
		PatientList.currentLine.click()
        browser.switchWindow(PatientDetailPage.getUrl() + '/' + patientTechIdOrIPP)
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Détail patient" doit être : ' + PatientDetailPage.getUrl()).toContain(PatientDetailPage.getUrl())

		Logger.log('L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP)
		expect(PatientDetailPage.patientTechIdOrIPP.waitForDisplayed()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toBe(true)
		expect(PatientDetailPage.patientTechIdOrIPP.getText()).withContext('@ L\'id technique ou l\'IPP du patient doit être : ' + patientTechIdOrIPP).toContain(patientTechIdOrIPP)
	})

	// Retour sur la page "Données patient"
	// ------------------------------------
	it('Retour sur la page "Données patient"', () => {
        Logger.log('Accès à la page "' + Page.titleValue + '"')
		browser.closeWindow()
		browser.switchWindow(Page.getUrl())
		expect(browser.getUrl()).withContext('@ L\'URL de la page "Données patient" doit être : ' + Page.getUrl()).toBe(Page.getUrl())

        /*Logger.log('Le titre de la page est : "' + Page.titleValue + '"')
        expect(Page.title.waitForDisplayed()).withContext('@ Le titre de la page est : "' + Page.titleValue + '"').toBe(true)*/		
	})

    // Fermer les filtres
    // ------------------
    it('Fermer les filtres', () => {
        Logger.log('Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText())
        PatientList.setCurrentLine(0)
        Logger.log('1ère ligne de la liste des patients : ' + PatientList.currentLineDisplayed)

        var lButtonList = PatientList.selectedFilters.buttonList
        
        for (var i=0; i<lButtonList.length; i++) {
            var lButtonLib = lButtonList[i].getText()

            Logger.log('Fermeture du filtre : ' + lButtonLib)
            expect(PatientList.selectedFilters.closeFilter(lButtonLib)).withContext('@ Fermeture du filtre : ' + lButtonLib).toBe(true)

            Logger.log('Le bouton du filtre "' + lButtonLib + '" n\'est plus affiché')
            expect(PatientList.selectedFilters.isFilterSelected(lButtonLib)).withContext('@ Le bouton du filtre "' + lButtonLib + '" n\'est plus affiché').toBe(false)

            PatientList.resetList()
            PatientList.setCurrentLine(0)
            expect(PatientList.currentLine.waitForDisplayed()).withContext('@ 1ère ligne de la liste des patients').toBe(true)
            Logger.log('1ère ligne de la liste des patients : ' + PatientList.currentLineDisplayed)
            
            Logger.log('Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText())
            expect(PatientList.nbSelectedPatients.waitForDisplayed()).withContext('@ Nombre de patients sélectionnés : ' + PatientList.nbSelectedPatients.getText()).toBe(true)
        }
    })

    // Déconnexion
	// -----------
	it('Déconnexion', () => {
		Logger.log('Déconnexion')
		Page.logout()
	})

})