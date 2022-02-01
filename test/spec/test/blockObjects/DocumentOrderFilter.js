class DocumentOrderFilter {

    box = ''
    
    get box () {
        return this.box
    }

    set box (pBox) {
        this.box = pBox
    }

    get block () { return this.box.$('div:nth-child(2) > div:nth-child(1) > div:nth-child(2)') }


    // Bloc "Ordre" (values)
    // ---------------------
    get titleValue () { return 'Ordre :' }
    get increasingLabelValue () { return 'Croissant' }
    get descendingLabelValue () { return 'Décroissant' }

    // Bloc "Ordre" (selectors)
    // ------------------------
    get title () { return this.block.$('span:nth-child(1)') }
    get increasingLabel () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(2)') }
    get descendingLabel () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(2)') }
    get increasingItem () { return this.block.$('div:nth-child(2) > label:nth-child(1) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }
    get descendingItem () { return this.block.$('div:nth-child(2) > label:nth-child(2) > span:nth-child(1) > span:nth-child(1) > input:nth-child(1)') }

    isSelected (pItem) {
        if (pItem.parentElement().parentElement().getAttribute('class').indexOf('Mui-checked') != -1)
            return true 
        else 
            return false
    }

}

module.exports = new DocumentOrderFilter()