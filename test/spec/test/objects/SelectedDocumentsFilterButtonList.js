const SelectedFilterButtonList = require("./SelectedFilterButtonList")

class SelectedDocumentsFilterButtonList extends SelectedFilterButtonList {

    init () { if (super.buttonListBlock == null) super.buttonListBlock = $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-justify-content-xs-flex-end > div:nth-child(2)') }

    get afterDateLib () { return 'Après le' }
    get beforeDateLib () { return 'Avant le' }

    get buttonListBlock () { 
        this.init()
        return super.buttonListBlock 
    }

    get buttonList () {
        this.init()
        return super.buttonList 
    }
    
    isAfterDateFilterSelected () {
        return super.isFilterSelected(this.afterDateLib)
    }

    isBeforeDateFilterSelected () {
        return super.isFilterSelected(this.beforeDateLib)
    }
}

module.exports = new SelectedDocumentsFilterButtonList()   