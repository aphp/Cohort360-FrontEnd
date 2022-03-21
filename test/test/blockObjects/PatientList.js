const COHORT360_PARAMS = require('../params/cohort360-param.js')
const PatientContextBar = require('../objects/PatientContextBar')
const PatientFilter = require('../objects/PatientFilter')
const SelectedPatientsFilterButtonList = require('../objects/SelectedPatientsFilterButtonList')
const List = require('../objects/List.js')
const PatientSearchFilter = require('./PatientSearchFilter.js')
const GenderFilter = require('./GenderFilter.js')

class PatientList extends List {

    /*get access () { 
        PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }*/

    get access () { 
        PatientContextBar.access.waitUntil(() => PatientContextBar.accessValue != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }

    get blockSelectorValue () { 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1 || browser.getUrl().indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            return 'div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-content-xs-flex-end' 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH) != -1) 
            return '.MuiGrid-grid-xs-12'
        return null    
    }

    get block () { return $(this.blockSelectorValue) }
    get filterBlock () { 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1 || browser.getUrl().indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            return $$(this.blockSelectorValue + ' > div')[0]
        if (browser.getUrl().indexOf(COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH) != -1) 
            return $(this.blockSelectorValue + ' > div:nth-child(2)')
        return null    
    }
    get selectedFilterBlock () { 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1 || browser.getUrl().indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            return $$(this.blockSelectorValue + ' > div')[1] 
        return null    
    }
    async listBlock () { 
        if ((await browser.getUrl()).indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1 || (await browser.getUrl()).indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            return await $$( this.blockSelectorValue + ' > div')[2] 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH) != -1)
            return $('div.MuiPaper-root:nth-child(3)') 
        return null
    }
    get navigationBlock () { 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1 || browser.getUrl().indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            return $$(this.blockSelectorValue + ' > nav')[0] 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH) != -1)    
            return $('.MuiPagination-root')
        return null
    }

    get genderMaleCode () { return 'M372' }
    get genderFemaleCode () { return 'M288' }
    get headerGenderValue () { return 'Sexe' }
    get headerFirstNameValue () { return 'Prénom' }
    get headerLastNameValue () { return 'Nom' }
    get headerAgeValue () { return 'Âge' }
    get headerBirthDateValue () { return 'Date de naissance' }
    get headerLastCareLocationValue () { return 'Dernier lieu de prise en charge' }
    get headerVitalStatusValue () { return 'Statut vital' }
    // get headerPatientTechIdValue () { return 'ID Technique Patient' }
    get headerPatientTechIdValue () { return 'IPP chiffré' }
    get headerPatientIPPValue () { return 'N° IPP' }
    get headerValue () { return '| ' + this.headerGenderValue + ' | ' + this.headerFirstNameValue + ' | ' + this.headerLastNameValue + ' | ' + (this.access == PatientContextBar.nominativeAccessValue ? this.headerBirthDateValue : this.headerAgeValue) + ' | ' + this.headerLastCareLocationValue + ' | ' + this.headerVitalStatusValue + ' | ' + (this.access == PatientContextBar.nominativeAccessValue ? this.headerPatientIPPValue : this.headerPatientTechIdValue) + ' |' }
    get aliveVitalStatusValue () { return 'Vivant' }
    get deadVitalStatusValue () { return 'Décédé' }

    get filterButtonValue () { return 'Filtrer' }

    get header () { return this.listBlock.$$('table')[0].$$('thead')[0].$$('tr')[0] }
    get headerGender () { return this.header.$('th.MuiTableCell-root:nth-child(1)') }
    get headerFirstName () { return this.header.$('th.MuiTableCell-root:nth-child(2)') }
    get headerLastName () { return this.header.$('th.MuiTableCell-root:nth-child(3)') }
    get headerAgeOrBirthDate () { return this.header.$('th.MuiTableCell-root:nth-child(4)') }
    get headerLastCareLocation () { return this.header.$('th.MuiTableCell-root:nth-child(5)') }
    get headerVitalStatus () { return this.header.$('th.MuiTableCell-root:nth-child(6)') }
    get headerPatientTechIdOrIPP () { return this.header.$('th.MuiTableCell-root:nth-child(7)') }
    get headerDisplayed () { return '| ' + this.headerGender.getText() + ' | ' + this.headerFirstName.getText() + ' | ' + this.headerLastName.getText() + ' | ' + this.headerAgeOrBirthDate.getText() + ' | ' + this.headerLastCareLocation.getText() + ' | ' + this.headerVitalStatus.getText() + ' | ' + this.headerPatientTechIdOrIPP.getText() + ' |' }

    async  allLineBlocks () {
        if (await super.allLineBlocks == null) {
            try {
                await this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr')[super.maxLine - 1] != null
            }
            catch (error) {
                await this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr') != null && this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr').length != 0
            }
            super.allLineBlocks = await this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr')
        }
        return await super.allLineBlocks
    }

    get currentLine () {
        return super.currentLineBlock()
    }

    get currentLineGender () { return this.currentLine.$('td:nth-child(1) > svg:nth-child(1) > path:nth-child(1)') }
    get currentLineFirstName () { return this.currentLine.$('td:nth-child(2)') }
    get currentLineLastName () { return this.currentLine.$('td:nth-child(3)') }
    get currentLineAgeOrBirthDate () { return this.currentLine.$('td:nth-child(4)') }
    get currentLineLastCareLocation () { return this.currentLine.$('td:nth-child(5)') }
    get currentLineVitalStatus () { return this.currentLine.$('td:nth-child(6) > div:nth-child(1) > span:nth-child(1)') }
    get currentLinePatientTechIdOrIPP () { return this.currentLine.$('td:nth-child(7)') }
    
    get currentLineDisplayed () { 
        const gender = (this.currentLineGender.getAttribute('d').indexOf(this.genderMaleCode) != -1 ? GenderFilter.maleLabelValue : (this.currentLineGender.getAttribute('d').indexOf(this.genderFemaleCode) != -1 ? GenderFilter.femaleLabelValue : GenderFilter.otherLabelValue))
        return gender + ' | ' + this.currentLineFirstName.getText() + ' | ' + this.currentLineLastName.getText() + ' | ' + this.currentLineAgeOrBirthDate.getText() + ' | ' + this.currentLineLastCareLocation.getText() + ' | ' + this.currentLineVitalStatus.getText() + ' | ' + this.currentLinePatientTechIdOrIPP.getText() 
    }

    get nbSelectedPatients () { return this.filterBlock.$('span.MuiTypography-root') }

    get nbPatients () { return parseInt(this.nbSelectedPatients.getText().substring(0, this.nbSelectedPatients.getText().indexOf('/')).replace(new RegExp(' ', 'g'), ''), 10) }

    get disabledSearchMessage () { return this.filterBlock.$('div:nth-child(1) > h6') }

    get filterButton () { return this.filterBlock.$('.MuiButton-contained') }
    get filter () { return PatientFilter }

    get searchFilter () { 
        if (browser.getUrl().indexOf(COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH) != -1)
            PatientSearchFilter.path = COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH
            if (browser.getUrl().indexOf(COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) != -1)
            PatientSearchFilter.path = COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH
        if (browser.getUrl().indexOf(COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH) != -1) 
            PatientSearchFilter.path = COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH
        return PatientSearchFilter 
    }

    get selectedFilters () { return SelectedPatientsFilterButtonList }

    get pagination () { return this.navigationBlock.$('.MuiPagination-ul') }

    get linesToCheck () {
        super.maxLine = this.allLineBlocks.length

        return super.linesToCheck
    }

    getCurrentLineGender() {
        return (this.currentLineGender.getAttribute('d').indexOf(this.genderMaleCode) != -1 ? GenderFilter.maleLabelValue : (this.currentLineGender.getAttribute('d').indexOf(this.genderFemaleCode) != -1 ? GenderFilter.femaleLabelValue : GenderFilter.otherLabelValue))
    }

    getCurrentLineAgeDigit () {
        var ageRegEx = new RegExp("\\d{1,3}\\s*ans?", "gi")
        var ageDigitRegEx = new RegExp("\\d{1,3}", "gi")
        return parseInt(this.currentLineAgeOrBirthDate.getText().match(ageRegEx)[0].match(ageDigitRegEx)[0])
    }

    initList () { 
        browser.pause(10000)
        return this.allLineBlocks 
    }
    resetList () {
        super.clearList()
        return this.initList()
    }

    patientTechIdOrIPP = ''

    get patientTechIdOrIPP () {
        return this.patientTechIdOrIPP
    }

    set patientTechIdOrIPP (pPatientTechIdOrIPP) {
        this.patientTechIdOrIPP = pPatientTechIdOrIPP
    }
}

module.exports = new PatientList()