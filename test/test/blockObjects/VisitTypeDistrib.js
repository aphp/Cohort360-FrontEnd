class VisitTypeDistrib {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(2) > div:nth-child(1)') }
    get block () { return $('#visit-type-repartition-card') }

    // Bloc "Répartition par type de visite" (values)
    // ----------------------------------------------
    get titleValue () { return 'Répartition par type de visite' }

    // Bloc "Répartition par type de visite" (selectors)
    // -------------------------------------------------
    get title () { return $('#visit-type-repartition-card-title') }
    get graph () { return $('#visit-type-repartition-card-svg') }
}

module.exports = new VisitTypeDistrib()