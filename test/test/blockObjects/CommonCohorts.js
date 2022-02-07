module.exports = class CommonCohorts {

    // Blocs "Mes cohortes favorites" & "Mes dernières cohortes créées"
    // ----------------------------------------------------------------
    get allCohortsLinkValue () { return 'Voir toutes mes cohortes' }
    get tableHeaderTitleValue () { return 'Titre' }
    get tableHeaderTypeValue () { return 'Type' }
    get tableHeaderStateValue () { return 'Statut' }
    // get tableHeaderPerimeterValue () { return 'Périmètre' }
    get tableHeaderNbPatientsValue () { return 'Nombre de patients' }
    get tableHeaderCreationDateValue () { return 'Date de création' }
    get tableHeaderFavoritesValue () { return 'Favoris' }
    get tableHeaderDeleteValue () { return 'Supprimer' }
    // get tableHeaderValue () { return this.tableHeaderTitleValue + ' | ' + this.tableHeaderStateValue + ' | ' + this.tableHeaderPerimeterValue + ' | ' + this.tableHeaderNbPatientsValue + ' | ' + this.tableHeaderCreationDateValue + ' | ' + this.tableHeaderFavoritesValue + ' | ' + this.tableHeaderDeleteValue}
    get tableHeaderValue () { return this.tableHeaderTitleValue + ' | ' + this.tableHeaderTypeValue + ' | ' + this.tableHeaderStateValue + ' | ' + this.tableHeaderNbPatientsValue + ' | ' + this.tableHeaderCreationDateValue + ' | ' + this.tableHeaderFavoritesValue + ' | ' + this.tableHeaderDeleteValue}
    get noCohortMessageValue () { return 'Aucune cohorte à afficher' }

}
