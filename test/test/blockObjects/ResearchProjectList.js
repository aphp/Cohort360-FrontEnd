const COHORT360_PARAMS = require('../params/cohort360-param.js')
const List = require('../objects/List.js')
const RequestList = require('./RequestList.js')

class ResearchProjectList extends List {

    get noRequestMessageValue () { return 'Aucune requête n\'est associée à ce projet de recherche' }
    get addRequestButtonLabel () { return 'Ajouter une requête' }
    get editRequestButtonLabel () { return 'Modifier la requête' }
    get addProjectButtonLabel () { return 'Ajouter un projet' }
    get editProjectButtonLabel () { return 'Modifier le projet' }

    get addProjectButton () { return $('#root > div.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-column > div.MuiGrid-root.MuiGrid-container.MuiGrid-align-items-xs-center.MuiGrid-justify-content-xs-center > div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-xs-11.MuiGrid-grid-sm-9 > button.MuiButtonBase-root.MuiButton-root.MuiButton-text') }

    // get blockSelectorValue () { return '[id="projects_table"] tbody.MuiTableBody-root:nth-child(2)' }
    get blockSelectorValue () { return '[id="projects_table"] > tbody.MuiTableBody-root:nth-child(2)' }
    get listBlockSelectorValue () { return this.blockSelectorValue + ' > tr.MuiTableRow-root' }

    get listBlock () { return $(this.blockSelectorValue) }

    get allLineBlocks () {
        if (super.allLineBlocks == null) {
            try {
                // browser.waitUntil(() => this.listBlock.$$('tr.MuiTableRow-root')[super.maxLine - 1] != null) 
                browser.waitUntil(() => $$(this.listBlockSelectorValue)[super.maxLine - 1] != null) 
            }
            catch (error) {
                // browser.waitUntil(() => this.listBlock.$$('tr.MuiTableRow-root') != null && this.listBlock.$$('tr.MuiTableRow-root').length != 0) 
                browser.waitUntil(() => $$(this.listBlockSelectorValue) != null && $$(this.listBlockSelectorValue).length != 0) 
            }
            
            // super.allLineBlocks = this.listBlock.$$('tr.MuiTableRow-root')
            super.allLineBlocks = $$(this.listBlockSelectorValue)
            
            /* var lAllLineBlocks = this.listBlock.$$('tr.MuiTableRow-root')
            
            super.allLineBlocks = []

            for (var i=0; i<lAllLineBlocks.length; i++) {
                if (i%2 == 0) {
                    super.allLineBlocks.push(lAllLineBlocks[i])
                }
            }*/
        }

        return super.allLineBlocks
    }

    get projectLineBlocks () {
        var lProjectLineBlocks = []

        this.initList ()

        for (var i=0; i<this.allLineBlocks.length; i++) {
            if (i%2 == 0) {
                lProjectLineBlocks.push(this.allLineBlocks[i])
            }
        }

        return lProjectLineBlocks
    }

    get currentProject () {
        return super.currentLineBlock
    }

    get currentProjectTitle () { return this.currentProject.$('td:nth-child(3) > p:nth-child(1)') }
    get currentProjectEditButton () { return this.currentProject.$('td:nth-child(3) > button:nth-child(2)') }
    get currentProjectAddRequestButton () { return this.currentProject.$('td:nth-child(3) > button:nth-child(3)') }
    get currentProjectDate () { return this.currentProject.$('td:nth-child(4)') }
    
    get currentProjectRequestBlock () { return this.allLineBlocks[this.LINE_NUMBER + 1].$('td:nth-child(1)') }
    get currentProjectRequestList () {
        // RequestList.listBlock = this.allLineBlocks[this.LINE_NUMBER + 1].$('td:nth-child(1)')
        RequestList.listBlock = this.currentProjectRequestBlock
        RequestList.resetList()
        return RequestList
    }

    /*get currentProjectRequests () { return this.currentProjectRequestBlock.$$('div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > table') }
    currentProjectRequestTitle (pIndex) { return this.currentProjectRequests[pIndex].$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > a:nth-child(1)') }
    currentProjectRequestDate (pIndex) { return this.currentProjectRequests[pIndex].$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4)') }
    currentProjectRequestEditButton (pIndex) { return this.currentProjectRequests[pIndex].$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > button:nth-child(2)') }*/

    currentProjectFirstRequest () { 
        this.currentProjectRequestList.setCurrentLine(0)
        return this.currentProjectRequestList.allLineBlocks[0]
    }

    currentProjectRequest (pIndex) { 
        this.currentProjectRequestList.setCurrentLine(pIndex)
        return this.currentProjectRequestList.allLineBlocks[pIndex]
    }

    currentProjectRequestTitle (pIndex) { 
        this.currentProjectRequestList.setCurrentLine(pIndex)
        return this.currentProjectRequestList.currentRequestTitle
    }
    currentProjectRequestDate (pIndex) { 
        this.currentProjectRequestList.setCurrentLine(pIndex)
        return this.currentProjectRequestList.currentRequestDate 
    }
    currentProjectRequestEditButton (pIndex) { 
        this.currentProjectRequestList.setCurrentLine(pIndex)
        return this.currentProjectRequestList.currentRequestEditButton 
    }

    currentProjectRequestDisplayed (pIndex) { return ' | ' + this.currentProjectRequestTitle(pIndex).getText() + ' | ' + this.currentProjectRequestDate(pIndex).getText() + ' | ' }

    get currentProjectNoRequest () { return this.currentProjectRequestBlock.$('div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > p') }
    get currentProjectNoRequestAddButton () { return this.currentProjectNoRequest.$('button') }

    get currentProjectDisplayed () { 
        return ' | ' + this.currentProjectTitle.getText() + ' | ' + this.currentProjectDate.getText() + ' | '
    }

    setCurrentProject (pLineNumber) { super.setCurrentLine(pLineNumber * 2) }

    getProjectByName (pProjectName) {
        var lFind = false
        for (var i=0; i<this.allLineBlocks.length / 2; i++) {
            this.setCurrentProject(i)
            if (this.currentProjectTitle.getText() == pProjectName) {
                lFind = true
                break
            }
        }
        return lFind
    }

    getProjectTest () {
        return this.getProjectByName(COHORT360_PARAMS.REQUEST_SEARCH_PROJECT_TEST_LIB)
    }

    // getCurrentProjectFirstRequest () { return this.currentProjectRequests[0] }

    // getCurrentProjectRequest (pIndex) { return this.currentProjectRequests[pIndex] }

    initList () { 
        browser.pause(10000)
        return this.allLineBlocks 
    }
    // initProjectList () { return this.projectLineBlocks }
    resetList () {
        super.clearList()
        return this.initList()
    }

}

module.exports = new ResearchProjectList()