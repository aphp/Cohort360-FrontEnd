class RequestCreate {

    get box () { return $('.MuiDialog-paper') }

    get titleValue () { return 'Création d\'une requête' }
    get requestNameInputLabel () { return 'Nom de la requête :' }
    get projectSelectBoxLabel () { return 'Projet :' }
    get descriptionInputLabel () { return 'Description :' }
    get newProjectLabel () { return 'Nouveau projet' }
    get cancelButtonValue () { return 'Annuler' }
    get createButtonValue () { return 'Créer' }

    get title () { return this.box.$('h2.MuiTypography-root') }
    get requestNameInput () { return this.box.$('#title') }
    get projectSelectBox () { return this.box.$('div.MuiInputBase-root:nth-child(2)') }
    get projectSelectBoxListValue () { return $$('div#menu- ul.MuiMenu-list > li.MuiButtonBase-root') }
    get newProjectNameInput () { return this.box.$('#project_name') }
    get descriptionInput () { return this.box.$('#description') }
    get cancelButton () { return this.box.$('button:nth-child(1)') }
    get createButton () { return this.box.$('button:nth-child(2)') }
}

module.exports = new RequestCreate()