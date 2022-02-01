const COHORT360_PARAMS = require('../params/cohort360-param.js')

class PatientSearchFilter {

    path = ''

    get path () {
        return this.path
    }

    /**
     * @param {string} pPath
     */
    set path (pPath) {
        this.path = pPath
    }

    get searchValueList () {
        var list = []
        if (COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length == 1 && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][0] == 'IPP' && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][1] == '') {
            list[0] = [ this.selectBoxAllLib, 'martin' ]
            list[1] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0]
        }
        else if (COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length > 1 && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][0] == 'IPP' && COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0][1] == '') {
            for (var i=0; i<COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length -1; i++) {
                list[i] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[i+1]
            }
            list[COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST.length-1] = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST[0]
        }
        else {
            list = COHORT360_PARAMS.PATIENT_SEARCH_FILTER_LIST 
        }
        return list 
    }

    get block () { 
        if (this.path == COHORT360_PARAMS.HOME_PAGE_PATH)
            return $('#search-patient-card')    

        if (this.path == COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH)
            return $('div.MuiGrid-grid-xs-12 > div:nth-child(2)') 
            
        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH || this.path == COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH)
            return $$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-xs-flex-end > div')[0].$$('div')[0]
        return null  
    }

    // Bloc "Explorer les données d'un patient" (values)
    // -------------------------------------------------
    get titleValue () { 
        if (this.path == COHORT360_PARAMS.HOME_PAGE_PATH)
            return 'Chercher un patient' 
            // return 'Explorer les données d\'un patient pris en charge' 
        /*if (this.path == COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH)
            return 'Rechercher un patient'*/
        return null
    }
    // get inputPlaceHolderValue () { return 'Rechercher les données d\'un patient: IPP, Nom ou Prénom' }
    get inputPlaceHolderValue () { return 'Cherchez un ipp, nom et/ou prénom' }

    // Bloc "Explorer les données d'un patient" (selectors)
    // ----------------------------------------------------
    get title () { 
        if (this.path == COHORT360_PARAMS.HOME_PAGE_PATH)
            return this.block.$('#search-patient-card-title') 
        /*if (this.path == COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH)
            return $('h1.MuiTypography-root')*/
        return null    
    }
    get input () { return this.block.$('input.MuiInputBase-input') }
    get searchButton () { 
        if (this.path == COHORT360_PARAMS.HOME_PAGE_PATH)
            return this.block.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-grid-xs-12 > button:nth-child(2)')               
        if (this.path == COHORT360_PARAMS.SEARCH_PATIENT_PAGE_PATH)
            return this.block.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-grid-xs-10 > button:nth-child(2)')   
        if (this.path == COHORT360_PARAMS.PATIENT_DATAS_PAGE_PATH || this.path == COHORT360_PARAMS.EXPLORE_PERIMETER_PATIENT_DATAS_PAGE_PATH) 
            return this.block.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-grid-xs-10 > button:nth-child(2)')
        return null
    }

    get clearButton () { return this.block.$('.MuiInputAdornment-root > button:nth-child(1)') }

    get selectBoxAllLib () { return COHORT360_PARAMS.PATIENT_SEARCH_ALL_LIB }
    get selectBoxFirstNameLib () { return COHORT360_PARAMS.PATIENT_SEARCH_FIRST_NAME_LIB }
    get selectBoxLastNameLib () { return COHORT360_PARAMS.PATIENT_SEARCH_LAST_NAME_LIB }
    get selectBoxIPPLib () { return COHORT360_PARAMS.PATIENT_SEARCH_IPP_LIB }
    get selectButton () { return this.block.$('.MuiInput-root') }
    // get selectBox () { return browser.$('div.MuiPaper-root:nth-child(3)') }
    // get selectBoxList () { return this.selectBox.$('ul') }
    get selectBox () { return browser.$('#menu-') }
    get selectBoxList () { return this.selectBox.$('div > ul') }
    get selectedValue () { return this.block.$('.MuiSelect-root') }

    getIndexOf (pItemLib) {
        for (var i=0; i<this.selectBoxList.$$('li').length; i++)
            if (this.selectBoxList.$$('li')[i].getText() == pItemLib)
                return i
        return -1
    }

    getSelectedItem (pItemLib) {
        return this.selectBoxList.$$('li')[this.getIndexOf(pItemLib)]
    }

}

module.exports = new PatientSearchFilter()