class VisitsPerMonthDistrib {

    get block () { return $('div.MuiGrid-root.MuiGrid-container.MuiGrid-item.MuiGrid-grid-md-11 > div:nth-child(2) > div:nth-child(5) > div:nth-child(1)') }
    get block () { return $('div.MuiGrid-root:nth-child(5) > div:nth-child(1) > div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded') }

    // Bloc "Répartition des visites par mois" (values)
    // ------------------------------------------------
    get titleValue () { return 'Répartition des visites par mois' }

    // Bloc "Répartition des visites par mois" (selectors)
    // ---------------------------------------------------
    get title () { return this.block.$('div:nth-child(1) > h3:nth-child(1)') }
    get graph () { return this.block.$('svg:nth-child(1)') }

}

module.exports = new VisitsPerMonthDistrib()