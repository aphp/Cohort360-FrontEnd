const COHORT360_PARAMS = require('../params/cohort360-param.js')
const List = require('../objects/List.js')

class RequestList extends List {

    listBlock = null

    get listBlock () {
        return this.listBlock
    }

    set listBlock (pListBlock) {
        this.listBlock = pListBlock
    }

    get requestSelectorValue () { return 'div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > table' }

    get allLineBlocks () {
        if (super.allLineBlocks == null) {
            try {
                browser.waitUntil(() => this.listBlock.$$(this.requestSelectorValue)[super.maxLine - 1] != null)  
            }
            catch (error) {
                browser.waitUntil(() => this.listBlock.$$(this.requestSelectorValue) != null && this.listBlock.$$(this.requestSelectorValue).length != 0)           
            }
            
            super.allLineBlocks = this.listBlock.$$(this.requestSelectorValue)
        }

        return super.allLineBlocks
    }

    get currentRequest () {
        return super.currentLineBlock
    }

    get currentRequestTitle () { return this.currentRequest.$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > a:nth-child(1)') }
    get currentRequestDate () { return this.currentRequest.$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4)') }
    get currentRequestEditButton () { return this.currentRequest.$('tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > button:nth-child(2)') }

    getRequestByName (pRequestName) {
        var lFind = false
        for (var i=0; i<this.allLineBlocks.length; i++) {
            this.setCurrentLine(i)
            if (this.currentRequestTitle.getText() == pRequestName) {
                lFind = true
                break
            }
        }
        return lFind
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

module.exports = new RequestList()