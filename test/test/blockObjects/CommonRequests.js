module.exports = class CommonRequests {

    // Blocs "Mes requêtes" & "Mes dernières requêtes créées"
    // ----------------------------------------------------------------
    get allRequestsLinkValue () { return 'Voir toutes mes requêtes' }
    get tableHeaderTitleValue () { return 'Titre' }
    get tableHeaderModificationDateValue () { return 'Date de modification' }
    get tableHeaderValue () { return this.tableHeaderTitleValue + ' | ' + this.tableHeaderModificationDateValue}
    get noRequestMessageValue () { return 'Aucune requête à afficher' }
}
