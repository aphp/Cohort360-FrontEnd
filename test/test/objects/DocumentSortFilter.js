const OrderFilterBlock = require("../blockObjects/DocumentOrderFilter")
const SortFilterBlock = require("../blockObjects/DocumentSortFilter")

class DocumentSortFilter {
    
    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Trier par :' }
    get cancelButtonValue () { return 'Annuler' }
    get validateButtonValue () { return 'Valider' }

    get title () { return this.box.$('h2.MuiTypography-h6') }

    get orderFilterBlock () { 
        OrderFilterBlock.box = this.box
        return OrderFilterBlock 
    }

    get sortByFilterBlock () { 
        SortFilterBlock.box = this.box
        return SortFilterBlock 
    }

    get cancelButton () { return this.box.$('button.MuiButton-root:nth-child(1)') }
    get validateButton () { return this.box.$('button.MuiButton-textPrimary:nth-child(2)') }

}

module.exports = new DocumentSortFilter()