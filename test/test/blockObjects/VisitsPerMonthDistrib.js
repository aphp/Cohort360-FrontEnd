class VisitsPerMonthDistrib {

    get block () { return $('#month-repartition-visit-card') }

    // Bloc "Répartition des visites par mois" (values)
    // ------------------------------------------------
    get titleValue () { return 'Répartition des visites par mois' }

    // Bloc "Répartition des visites par mois" (selectors)
    // ---------------------------------------------------
    get title () { return this.block.$('#month-repartition-visit-card-title') }
    get graph () { return this.block.$('#month-repartition-visit-card-svg') }

}

module.exports = new VisitsPerMonthDistrib()