class ResearchProjectCreate {

    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Créer un projet de recherche' }
    get projectNameInputLabel () { return 'Nom du projet :' }
    get cancelButtonValue () { return 'Annuler' }
    get createButtonValue () { return 'Créer' }

    get title () { return this.box.$('h2.MuiTypography-root') }
    get projectNameInput () { return this.box.$('#title') }
    get cancelButton () { return this.box.$('button:nth-child(1)') }
    get createButton () { return this.box.$('button:nth-child(2)') }
}

module.exports = new ResearchProjectCreate()