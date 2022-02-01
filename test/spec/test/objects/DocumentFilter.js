const TypeFilterBlock = require("../blockObjects/DocumentTypeFilter")
const DateFilterBlock = require("../blockObjects/DocumentDateFilter")

class DocumentFilter {
    
    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Filtrer par :' }
    get cancelButtonValue () { return 'Annuler' }
    get validateButtonValue () { return 'Valider' }

    get title () { return this.box.$('h2.MuiTypography-h6') }

    get typeFilterBlock () { 
        TypeFilterBlock.box = this.box
        return TypeFilterBlock 
    }

    get dateFilterBlock () { 
        DateFilterBlock.box = this.box
        return DateFilterBlock 
    }

    get cancelButton () { return this.box.$('button.MuiButton-root:nth-child(1)') }
    get validateButton () { return this.box.$('button.MuiButton-textPrimary:nth-child(2)') }

}

module.exports = new DocumentFilter()