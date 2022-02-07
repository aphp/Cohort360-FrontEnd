const COHORT360_PARAMS = require('../params/cohort360-param.js')
const Page = require('./Page')
const LeftMenu = require('../objects/LeftMenu')
const RequestCreateBox = require('../objects/RequestCreate')
const HospitalStructureListBlock = require('../blockObjects/HospitalStructureList.js')

class NewCohortPage extends Page {

    get path () { return COHORT360_PARAMS.NEW_COHORT_PAGE_PATH }

    get hospitalStructureListBlock () { return HospitalStructureListBlock }
    get createRequestBox () { return RequestCreateBox }

    get titleValue () { return 'Nouvelle cohorte' }
    get sourcePopulationChoiceButtonValue () { return 'Choisir une population source' }
    get sourcePopulationChoiceButton () { return $('div.MuiGrid-root.MuiGrid-container button.MuiButtonBase-root.MuiButton-root.MuiButton-text') }
    get sourcePopulationBlock () { return $('div#root div div div.MuiGrid-root.MuiGrid-container div div.MuiGrid-root div') }

    get createCohortButtonValue () { return 'Créer la cohorte' }
    get cancelButtonValue () { return 'Annuler' }
    get restoreButtonValue () { return 'Rétablir' }
    get resetButtonValue () { return 'Réinitialiser' }
    get createCohortButton () { return $('') }
    get cancelButton () { return $('') }
    get restoreButton () { return $('') }
    get resetButton () { return $('') }

    get accessLibValue () { return 'ACCÈS:' }
    get accessLib () { return $('div.MuiGrid-root:nth-child(2) > div:nth-child(1) > p:nth-child(1)') }
    get accessDefaultValue () { return '-' }
    get access () { return $('div.MuiGrid-root:nth-child(2) > div:nth-child(1) > p:nth-child(2)') }

    get counterLibValue () { return 'PATIENTS INCLUS' }
    get counterLib () { return $('div.MuiGrid-root:nth-child(3) > div:nth-child(1) > p:nth-child(1)') }
    // get counterProgress () { return $('div.MuiCircularProgress-root:nth-child(2) > svg:nth-child(1)') }
    get counterDefaultValue () { return '-' }

    get counter () {       
        /*if (this.counterProgress != null) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! counterProgress is not null !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            // browser.waitUntil(() => ($('div.MuiGrid-root:nth-child(3) > div:nth-child(1) > p:nth-child(2)') != null))
            browser.waitUntil(() => (this.counterProgress === null))
        }
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! counterProgress is null !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')*/
        var counterSelector = $('div.MuiGrid-root:nth-child(3) > div:nth-child(1) > p:nth-child(2)')
        browser.waitUntil(() => ((counterSelector != null) && (counterSelector.getText() != this.counterDefaultValue)))
        return counterSelector 
    }

    open () {
        return super.open(this.path)
    }

    getUrl () {
        return super.getUrl(this.path)
    }

    login (username, password) {
        super.login (username, password)
        LeftMenu.open()
        // LeftMenu.openMyPatientsMenu()
        LeftMenu.newCohortButton.click()
        browser.waitUntil(() => browser.getUrl() === this.getUrl())
        // super.access.getText()
    }

}

module.exports = new NewCohortPage()