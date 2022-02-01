const COHORT360_PARAMS = require('../params/cohort360-param.js')
const PatientContextBar = require('../objects/PatientContextBar')
const DocumentSortFilter = require('../objects/DocumentSortFilter')
const DocumentFilter = require('../objects/DocumentFilter')
const Calendar = require('../objects/Calendar.js')
const SelectedDocumentsFilterButtonList = require('../objects/SelectedDocumentsFilterButtonList.js')
const DocumentSearchFilter = require('./DocumentSearchFilter.js')
const List = require('../objects/List.js')

class DocumentList extends List {

    /*get access () { 
        PatientContextBar.accessValue.waitUntil(() => PatientContextBar.accessValue.getText() != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }*/

    get access () { 
        PatientContextBar.access.waitUntil(() => PatientContextBar.accessValue != PatientContextBar.defaultAccessValue) 
        return PatientContextBar.accessValue
    }

    get unknownLib () { return 'Inconnu' }

    get blockSelectorValue () { return 'div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-content-xs-flex-end' }
    get filterButtonValue () { return 'Filtrer' }
    get sortFilterButtonValue () { return 'Trier' }

    get block () { return $(this.blockSelectorValue) }
    get filterBlock () { return $$(this.blockSelectorValue + ' > div')[0] }
    get selectedFilterBlock () { return $$(this.blockSelectorValue + ' > div')[1] }
    get listBlock () { return $$(this.blockSelectorValue + ' > div')[2] }
    get navigationBlock () { return $$(this.blockSelectorValue + ' > nav')[0] }

    /* get allLineBlocks () {
        if (super.allLineBlocks == null) {
            try {
                browser.waitUntil(() => this.listBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column')[super.maxLine - 1] != null) 
            }
            catch (error) {
                browser.waitUntil(() => this.listBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column') != null && this.listBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column').length != 0) 
            }
            var firstLineParentElement = this.listBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column')[0].parentElement()
            super.allLineBlocks = $$(firstLineParentElement.getTagName() + '.' + firstLineParentElement.getAttribute('class').replace(/ /g, '.') + ' > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column')
        }
        return super.allLineBlocks
    }

    get currentLine () {
        return super.currentLineBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item')[0] 
    }*/

    get allLineBlocks () {
        if (super.allLineBlocks == null) {
            try {
                browser.waitUntil(() => this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr')[super.maxLine - 1] != null) 
            }
            catch (error) {
                browser.waitUntil(() => this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr') != null && this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr').length != 0) 
            }
            super.allLineBlocks = this.listBlock.$$('table')[0].$$('tbody')[0].$$('tr')
        }
        return super.allLineBlocks
    }

    get currentLine () {
        return super.currentLineBlock
    }
    
    get currentLineDocumentExcerpt () {
        // return this.currentLineBlock.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column > p.MuiTypography-root.MuiTypography-body1')[4]
        // this.setCurrentLine(this.lineNumber + 1)
        // return this.currentLine.$$('td')[0]
        return this.currentLine
    }
    get currentLineDocumentExcerptHighlightedTerm () {
        return this.currentLineDocumentExcerpt.$$('b[style="background-color:#fffbb8;"]')
    }

    getCurrentLineDocumentExcerptHighlightedTerm () {
        var highlightTerm = []
        for (var i=0; i<this.currentLineDocumentExcerptHighlightedTerm.length; i++) {
            highlightTerm[i] = this.currentLineDocumentExcerptHighlightedTerm[i].getText()
        }
        return highlightTerm
    }

    /*get currentLineDocumentInfos () { return this.currentLine.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-direction-xs-column.MuiGrid-justify-xs-center.MuiGrid-grid-xs-4') }
    get currentLineDocumentName () { return this.currentLineDocumentInfos.$('span.MuiTypography-root.MuiTypography-button') }
    get currentLineDocumentDate () { return this.currentLineDocumentInfos.$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLineDocumentStatus () { return this.currentLineDocumentInfos.$('span.MuiChip-label') }
    get currentLinePatientInfos () { return this.currentLine.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-xs-space-around.MuiGrid-grid-xs-8') }
    get currentLinePatientId () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[0].$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLinePatientIdButton () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[0].$('button') }
    get currentLineVisitId () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[1].$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLineExecutingUnit () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[2].$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLineVisitStatus () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[3].$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLinePDF () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-xs-center.MuiGrid-grid-xs-1')[0] }
    get currentLinePDFButton () { return this.currentLinePDF.$('button') }*/

    get currentLineDocumentInfos () { return this.currentLine.$('td:nth-child(1)') }
    get currentLineDocumentName () { return this.currentLineDocumentInfos.$('span.MuiTypography-root.MuiTypography-button') }
    get currentLineDocumentDate () { return this.currentLineDocumentInfos.$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLineDocumentStatus () { return this.currentLineDocumentInfos.$('span.MuiChip-label') }
    // get currentLinePatientInfos () { return this.currentLine.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-xs-space-around.MuiGrid-grid-xs-8') }
    get currentLinePatientId () { return this.currentLine.$('td:nth-child(2) > div:nth-child(1) > p:nth-child(2)') }
    get currentLinePatientIdButton () { return this.currentLine.$('td:nth-child(2) > div:nth-child(1) > button:nth-child(3)') }
    get currentLineVisitId () { return this.currentLine.$('td:nth-child(3) > div:nth-child(1) > p:nth-child(2)') }
    get currentLineExecutingUnit () { return this.currentLine.$('td:nth-child(4) > div:nth-child(1) > p:nth-child(2)') }
    // get currentLineVisitStatus () { return this.currentLinePatientInfos.$$('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-justify-xs-center')[3].$('p.MuiTypography-root.MuiTypography-body1') }
    get currentLinePDF () { return this.currentLine.$('td:nth-child(5) > div:nth-child(1) > p:nth-child(2)') }
    get currentLinePDFButton () { return this.currentLine.$('td:nth-child(6) > button:nth-child(1)') }
    
    get currentLineDisplayed () { return '| ' + this.currentLineDocumentName.getText() + ', ' + this.currentLineDocumentDate.getText() + ', ' + this.currentLineDocumentStatus.getText() + ' | ' + this.currentLinePatientId.getText() + ' | '  + this.currentLineVisitId.getText() + ' | ' + this.currentLineExecutingUnit.getText() + ' | PDF |'}

    get nbSelectedDocuments () { return this.filterBlock.$('span.MuiTypography-root.MuiTypography-button') }
    // get nbSelectedDocuments () { return this.filterBlock.$('div:nth-child(1) > span:nth-child(1)') }

    get filterButton () { return this.filterBlock.$('button.MuiButtonBase-root:nth-child(3)') }
    get filter () { return DocumentFilter }

    get sortFilterButton () { return this.filterBlock.$('button.MuiButtonBase-root:nth-child(4)') }
    get sortFilter () { return DocumentSortFilter }

    get searchFilter () { 
        DocumentSearchFilter.block = this.filterBlock.$('div.MuiGrid-root.MuiGrid-container.MuiGrid-align-items-xs-center > div > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-grid-xs-10')
        return DocumentSearchFilter 
    }

    get selectedFilters () { return SelectedDocumentsFilterButtonList }

    get pagination () { return this.navigationBlock.$('.MuiPagination-ul') }

    get linesToCheck () {
        if (super.maxLine > this.allLineBlocks.length)
            super.maxLine = this.allLineBlocks.length

        return super.linesToCheck
    }

    checkCurrentLineDocumentDate (pAfterDate, pBeofrDate) {
        var lDate = new Date(Calendar.toEnDateFormat(this.currentLineDocumentDate.getText().substring(0, this.currentLineDocumentDate.getText().indexOf(' '))))
        var lAfterDate = new Date(Calendar.toEnDateFormat(pAfterDate))
        var lBeofrDate = new Date(Calendar.toEnDateFormat(pBeofrDate))

        if (lDate >= lAfterDate && lDate <= lBeofrDate)
            return true

        return false
    }

    checkCurrentLineDocumentType () {
        var lDocumentName = this.currentLineDocumentName.getText()

        for (var i=0; i<COHORT360_PARAMS.DOCUMENT_TYPE_FILTER_TYPE_LIST.length; i++)
            if (lDocumentName.indexOf(COHORT360_PARAMS.DOCUMENT_TYPE_FILTER_TYPE_LIST[i][1]) != -1)
                return true
        return false
    }

    checkCurrentLineDocumentExcerpt (pSearchValue) {

        if (pSearchValue.substring(0,1) == '"' && pSearchValue.substring(pSearchValue.length - 1) == '"') {
            var lSearchValueArray = pSearchValue.substring(1, pSearchValue.length - 1).split(" ")
            var lSearchValue = ""
            for (var i=0; i<lSearchValueArray.length; i++)
                lSearchValue = (lSearchValue + " " + lSearchValueArray[i].trim()).trim()

            if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValue.toUpperCase()) != -1)
                return true

            return false
        }

       var lLengthAll = pSearchValue.split("AND").length + pSearchValue.split("OR").length + pSearchValue.split("NOT").length

        if (lLengthAll > 4) {
            return false
        }    

        if (pSearchValue.split("AND").length > 1) {
            var lSearchValueArray = pSearchValue.split("AND")
            
            if (lSearchValueArray.length > 2) {
                return false
            }

            if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[0].trim().toUpperCase()) != -1 && this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[1].trim().toUpperCase()) != -1) {
                return true
            }
            
            return false
        }

        if (pSearchValue.split("OR").length > 1) {
            var lSearchValueArray = pSearchValue.split("OR")
            
            if (lSearchValueArray.length > 2)
                return false

            if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[0].trim().toUpperCase()) != -1 || this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[1].trim().toUpperCase()) != -1)
                return true
            
            return false
        }

        if (pSearchValue.split("NOT").length > 1) {
            var lSearchValueArray = pSearchValue.split("NOT")
            
            if (lSearchValueArray.length > 2)
                return false

            if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[0].trim().toUpperCase()) != -1 && this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[1].trim().toUpperCase()) == -1)
                return true
            
            return false
        }

        if (pSearchValue.split(" ").length > 1) {
            var lSearchValueArray = pSearchValue.split(" ")
            
            if (lSearchValueArray.length > 2)
                return false

            if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[0].trim().toUpperCase()) != -1 || this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(lSearchValueArray[1].trim().toUpperCase()) != -1)
                return true
            
            return false
        }

        if (this.currentLineDocumentExcerpt.getText().toUpperCase().indexOf(pSearchValue.trim().toUpperCase()) != -1)
            return true

        return false
    }

    initList () { 
        browser.pause(10000)
        return this.allLineBlocks 
    }

    resetList () {
        super.clearList()
        return this.initList()
    }
}

module.exports = new DocumentList()