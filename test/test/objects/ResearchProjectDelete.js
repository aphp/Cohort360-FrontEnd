class ResearchProjectDelete {

    get box () { return $('.MuiDialog-paperWidthXs') }

    get titleValue () { return 'Supprimer un projet de recherche' }
    get messageValue () { return 'Êtes-vous sur de vouloir supprimer ce projet de recherche ? L\'ensemble des requêtes liées à ce projet vont être supprimées également' }
    get cancelButtonValue () { return 'Annuler' }
    get deleteButtonValue () { return 'Supprimer' }

    get title () { return this.box.$('h2.MuiTypography-root') }
    get message () { return this.box.$('div:nth-child(2) > p:nth-child(1)') }
    get cancelButton () { return this.box.$('button:nth-child(1)') }
    get deleteButton () { return this.box.$('button:nth-child(2)') }
}

module.exports = new ResearchProjectDelete()