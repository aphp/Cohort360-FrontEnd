module.exports = class SelectedFilterButtonList {

    buttonListBlock = null

    get buttonListBlock () { return this.buttonListBlock }
    set buttonListBlock (pButtonListBlock) { this.buttonListBlock = pButtonListBlock }
   
    get buttonList () {
        var lButtonList = []
        for (var i=0; i<this.buttonListBlock.$$('div').length; i++)
            lButtonList[i] = this.buttonListBlock.$$('div')[i]
        return lButtonList
    }

    getButton (pButtonLib) {
        for (var i=0; i<this.buttonList.length; i++)
            if (this.buttonList[i].getText().indexOf(pButtonLib) != -1)
                return this.buttonList[i]
        return null
    }

    isFilterSelected (pFilterLib) {
        if (this.getButton(pFilterLib) != null)
            return true
        return false
    }

    closeFilter (pFilterLib) {
        if (this.getButton(pFilterLib) != null) {
            this.getButton(pFilterLib).$('svg:nth-child(2)').click()
            return true
        }
        return false
    }

}
