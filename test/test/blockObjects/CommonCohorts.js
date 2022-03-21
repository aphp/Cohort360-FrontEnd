module.exports = class CommonCohorts {

    // Blocs "Mes cohortes favorites" & "Mes dernières cohortes créées"
    // ----------------------------------------------------------------
    get allCohortsLinkValue () { return 'Voir toutes mes cohortes' }
    get tableHeaderTitleValue () { return 'Titre' }
    get tableHeaderTypeValue () { return 'Type' }
    get tableHeaderStatusValue () { return 'Statut' }
    get tableHeaderNbPatientsValue () { return 'Nombre de patients' }
    get tableHeaderEstimateNbPatientsValue () { return 'Estimation du nombre de patients APHP' }
    get tableHeaderFavoriteValue () { return 'Favoris' }
    get tableHeaderModificationDateValue () { return 'Date de modification' }
    get tableHeaderValue () { return this.tableHeaderTitleValue + ' | ' + this.tableHeaderFavoriteValue + ' | ' + this.tableHeaderTypeValue + ' | ' + this.tableHeaderStatusValue + ' | ' + this.tableHeaderNbPatientsValue + ' | ' + this.tableHeaderEstimateNbPatientsValue + ' | ' + this.tableHeaderModificationDateValue}
    get noCohortMessageValue () { return 'Aucune cohorte à afficher' }
}
