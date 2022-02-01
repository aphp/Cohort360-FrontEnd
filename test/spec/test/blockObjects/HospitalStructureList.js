const COHORT360_PARAMS = require('../params/cohort360-param.js')
const List = require('../objects/List.js')

class HospitalStructureList extends List {

    // get listBlock () { return $('.MuiTable-root') }
    get block () { return $('div.MuiPaper-root:nth-child(3)') }
    get listHeaderBlock () { return this.block.$('table.MuiTable-root > thead.MuiTableHead-root') }
    get listBlock () { return this.block.$('table.MuiTable-root > tbody.MuiTableBody-root') }
    
    get titleValue() { return 'Structure hospitalière' }
    get confirmButtonValue() { return 'Confirmer' }
    get cancelButtonValue() { return 'Annuler' }
    get confirmButton() { return this.block.$('button.MuiButton-contained') }
    get cancelButton() { return this.block.$('button.MuiButton-outlined') }

    get allLineBlocks () {
        if (super.allLineBlocks == null) {
            try {
                browser.waitUntil(() => this.listBlock.$$('tr.MuiTableRow-root')[super.maxLine - 1] != null) 
            }
            catch (error) {
                browser.waitUntil(() => this.listBlock.$$('tr.MuiTableRow-root') != null && this.listBlock.$$('tr.MuiTableRow-root').length != 0) 
            }
            
            super.allLineBlocks = this.listBlock.$$('tr.MuiTableRow-root')
        }
        return super.allLineBlocks
    }

    get currentLine () {
        return super.currentLineBlock 
    }

    get currentLineCheckBox () {
        return this.currentLine.$('td:nth-child(2) input')
    }

    get currentLineName () {
        return this.currentLine.$('td:nth-child(3) > p:nth-child(1)')
    }

    initList () { 
        browser.pause(10000)
        return this.allLineBlocks 
    }
    
    resetList () {
        super.clearList()
        return this.initList()
    }

    get linesToCheck () {
        super.maxLine = this.allLineBlocks.length
        return super.linesToCheck
    }
}

module.exports = new HospitalStructureList()