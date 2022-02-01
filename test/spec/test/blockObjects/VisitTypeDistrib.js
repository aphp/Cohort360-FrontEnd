class VisitTypeDistrib {

    // get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(2) > div:nth-child(1)') }
    get block () { return $('div.MuiGrid-grid-lg-4:nth-child(2) > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded') }

    // Bloc "Répartition par type de visite" (values)
    // ----------------------------------------------
    get titleValue () { return 'Répartition par type de visite' }

    // Bloc "Répartition par type de visite" (selectors)
    // -------------------------------------------------
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get graph () { return this.block.$('svg:nth-child(1)') }
}

module.exports = new VisitTypeDistrib()