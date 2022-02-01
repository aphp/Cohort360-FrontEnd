class ResearchProjectEdit {

    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Modifier un projet de recherche' }
    get projectNameInputLabel () { return 'Nom du projet :' }
    get deleteButtonValue () { return 'Supprimer' }
    get cancelButtonValue () { return 'Annuler' }
    get modifyButtonValue () { return 'Modifier' }

    get title () { return this.box.$('h2.MuiTypography-root') }
    get projectNameInput () { return this.box.$('#title') }
    get deleteButton () { return this.box.$('button:nth-child(1)') }
    get cancelButton () { return this.box.$('button:nth-child(2)') }
    get modifyButton () { return this.box.$('button:nth-child(3)') }
}

module.exports = new ResearchProjectEdit()